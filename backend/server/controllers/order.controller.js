import Order from "../models/order.model.js"
import Customer from "../models/customer.model.js"
import Product from "../models/product.model.js"
import {
    createPaymentOrder,
    generateSignature,
    getPublicKeyId,
    isRazorpayConfigured
} from "../config/razorpay.js"

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const loadPopulatedCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: "cart.product",
        select: "name price image stock"
    })
    if (!customer) return null
    // Drop cart rows whose product was deleted in the meantime
    return (customer.cart || []).filter((item) => item.product !== null)
}

// Task 4 — server owns pricing rules. The frontend never sends items or totals.
const validateShippingAddress = (addr) => {
    const errors = {}

    const isNonEmpty = (v) => typeof v === "string" && v.trim().length > 0

    if (!isNonEmpty(addr?.fullName)) errors.fullName = "Full name is required"
    if (!isNonEmpty(addr?.addressLine1)) errors.addressLine1 = "Address is required"
    if (!isNonEmpty(addr?.city)) errors.city = "City is required"
    if (!isNonEmpty(addr?.state)) errors.state = "State is required"

    // Phone must be a valid numeric format (10-13 digits, allowing a leading +)
    if (!/^(\+?\d{10,13})$/.test(String(addr?.phone || "").trim())) {
        errors.phone = "Phone must be a valid number (10-13 digits)"
    }

    // Pincode must contain exactly 6 digits
    if (!/^\d{6}$/.test(String(addr?.pincode || "").trim())) {
        errors.pincode = "Pincode must contain 6 digits"
    }

    // Whitespace-only values are invalid
    if (
        addr &&
        Object.values(addr).some(
            (v) => typeof v === "string" && v.length > 0 && v.trim().length === 0
        )
    ) {
        errors.form = "Fields cannot contain only whitespace"
    }

    return errors
}

const buildSnapshotItems = (cartItems) =>
    cartItems.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price, // snapshot of the CURRENT price
        quantity: item.quantity,
        image: item.product.image
    }))

const calculateTotal = (snapshotItems) =>
    snapshotItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

const sanitizeOrder = (order) => order

// ---------------------------------------------------------------------------
// POST /orders/create-payment-order — Task 4 (20 marks)
// ---------------------------------------------------------------------------

export const createPaymentOrderController = async (req, res) => {
    try {
        const shippingErrors = validateShippingAddress(req.body.shippingAddress)
        if (Object.keys(shippingErrors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipping address",
                errors: shippingErrors
            })
        }

        // 1-2. Load the authenticated user's cart
        const cartItems = await loadPopulatedCart(req.user._id)
        if (!cartItems) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // 3. Empty cart must be rejected
        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Add products before checkout."
            })
        }

        // 4-5. Product docs are loaded again — never trust stale cart data.
        // (populate above is the fresh load; deleted products were filtered out)
        const deletedProducts = (req.user.cart || []).length - cartItems.length
        if (deletedProducts > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Some products in your cart are no longer available. Please review your cart."
            })
        }

        // 6. Final stock verification — stock may have changed since add-to-cart
        for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product.name}. Only ${item.product.stock} left.`
                })
            }
        }

        // 7-8. Build snapshot + calculate total on the SERVER (Section 11, 12)
        const items = buildSnapshotItems(cartItems)
        const totalAmount = calculateTotal(items)

        // 9. Persist the pending ShopKart order
        const shopKartOrder = await Order.create({
            user: req.user._id,
            items,
            shippingAddress: {
                fullName: req.body.shippingAddress.fullName.trim(),
                phone: req.body.shippingAddress.phone.trim(),
                addressLine1: req.body.shippingAddress.addressLine1.trim(),
                city: req.body.shippingAddress.city.trim(),
                state: req.body.shippingAddress.state.trim(),
                pincode: req.body.shippingAddress.pincode.trim()
            },
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        })

        // 10. Create the Razorpay Order — amount converted to paise (Section 27)
        let razorpayOrder
        try {
            razorpayOrder = await createPaymentOrder({
                amountInPaise: Math.round(totalAmount * 100),
                receipt: shopKartOrder._id.toString()
            })
        } catch (razorpayError) {
            // Order creation failed — do NOT clear the cart, mark order failed
            shopKartOrder.paymentStatus = "FAILED"
            await shopKartOrder.save()

            console.error("Razorpay order creation failed:", razorpayError.message)
            return res.status(502).json({
                success: false,
                message: "Payment gateway unavailable. Your cart is unchanged. Please try again."
            })
        }

        // 11. Save the Razorpay order id on the ShopKart order
        shopKartOrder.razorpayOrderId = razorpayOrder.id
        await shopKartOrder.save()

        // 12. Return safe checkout data (Key ID is public; Secret is NEVER sent)
        return res.status(201).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: getPublicKeyId(),
            demoMode: !isRazorpayConfigured
        })

    } catch (error) {
        console.error("createPaymentOrder error:", error)
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// ---------------------------------------------------------------------------
// POST /orders/verify-payment — Task 5 + Section 27 Steps 11-13
// ---------------------------------------------------------------------------

export const verifyPaymentController = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_payment_id, razorpay_signature } =
            req.body

        if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification fields"
            })
        }

        const order = await Order.findById(shopKartOrderId)
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        // Ownership check — users can only verify payments on their own orders
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.paymentStatus === "PAID") {
            return res.status(200).json({
                success: true,
                message: "Order already confirmed",
                order: sanitizeOrder(order)
            })
        }

        // Section 28: use the Razorpay Order ID STORED in the database as the
        // trusted source for HMAC generation — never the browser's copy.
        const expectedSignature = generateSignature(
            order.razorpayOrderId,
            razorpay_payment_id
        )

        if (expectedSignature !== razorpay_signature) {
            // Invalid signature — order stays unpaid and the cart is NOT cleared
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            })
        }

        // Only after verification succeeds: mark paid and confirm the order
        order.paymentStatus = "PAID"
        order.status = "PLACED"
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        // Task 5 — clear the user's cart only after successful verification
        req.user.cart = []
        await req.user.save()

        return res.status(200).json({
            success: true,
            message: "Payment verified. Order placed successfully.",
            order: sanitizeOrder(order)
        })

    } catch (error) {
        console.error("verifyPayment error:", error)
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// ---------------------------------------------------------------------------
// POST /orders/demo-pay — DEMO PAYMENT ENDPOINT (dev only)
//
// Used only when no Razorpay keys are configured. It simulates a successful
// test-mode payment: it returns payment_id + order_id + a REAL HMAC signature
// computed from the stored razorpayOrderId, so /orders/verify-payment runs the
// exact same verification path. Never active when real keys are configured.
// ---------------------------------------------------------------------------

export const demoPayController = async (req, res) => {
    try {
        if (isRazorpayConfigured) {
            return res.status(404).json({
                success: false,
                message: "Not available when Razorpay keys are configured"
            })
        }

        const { shopKartOrderId } = req.body

        const order = await Order.findById(shopKartOrderId)
        if (!order || order.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.paymentStatus === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Order already paid"
            })
        }

        const razorpayPaymentId = `pay_demo_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
        const signature = generateSignature(order.razorpayOrderId, razorpayPaymentId)

        return res.status(200).json({
            success: true,
            razorpay_order_id: order.razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: signature
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// ---------------------------------------------------------------------------
// GET /orders — Task 7: current user's orders, newest first
// ---------------------------------------------------------------------------

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1
        })

        return res.status(200).json({
            success: true,
            orders
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// ---------------------------------------------------------------------------
// GET /orders/:id — single order with strict ownership check (Section 17)
// ---------------------------------------------------------------------------

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params

        const order = await Order.findById(id)
        if (!order || order.user.toString() !== req.user._id.toString()) {
            // Same response whether missing or not owned — no ID guessing
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        return res.status(200).json({
            success: true,
            order
        })

    } catch (error) {
        // Invalid ObjectId also lands here
        return res.status(404).json({
            success: false,
            message: "Order not found"
        })
    }
}

// ---------------------------------------------------------------------------
// BONUS — PATCH /orders/:id/status: basic status progression (dev/admin)
// PLACED -> CONFIRMED -> SHIPPED -> DELIVERED
// ---------------------------------------------------------------------------

const STATUS_FLOW = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"]

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const order = await Order.findById(id)
        if (!order || order.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.paymentStatus !== "PAID") {
            return res.status(400).json({
                success: false,
                message: "Only paid orders can progress"
            })
        }

        const currentIndex = STATUS_FLOW.indexOf(order.status)
        const nextIndex = STATUS_FLOW.indexOf(status)

        if (nextIndex === -1) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${STATUS_FLOW.join(", ")}`
            })
        }

        if (nextIndex !== currentIndex + 1) {
            return res.status(400).json({
                success: false,
                message: `Invalid progression from ${order.status} to ${status}`
            })
        }

        order.status = status
        await order.save()

        return res.status(200).json({
            success: true,
            order
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}
