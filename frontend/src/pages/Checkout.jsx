import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import axiosInstance from "../axiosCalls/axios"
import CheckoutForm from "../components/CheckoutForm"
import { validateShippingForm } from "../utils/validation"
import OrderSummary from "../components/OrderSummary"

// Section 27 Step 9 — load the Razorpay Checkout script in the browser.
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        // Already loaded
        if (window.Razorpay) {
            return resolve(true)
        }

        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"

        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)

        document.body.appendChild(script)
    })
}

const EMPTY_ADDRESS = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
}

function Checkout() {
    const navigate = useNavigate()
    const { cartItems, loading, totalUnits, clearCart } = useCart()

    const [address, setAddress] = useState(EMPTY_ADDRESS)
    const [formErrors, setFormErrors] = useState({})
    const [placing, setPlacing] = useState(false) // "Place Order" loading state
    const [paying, setPaying] = useState(false) // payment window open
    const [backendError, setBackendError] = useState("")
    const [demoOpen, setDemoOpen] = useState(false) // simulated payment window (demo mode)
    const [pendingOrder, setPendingOrder] = useState(null) // checkout data awaiting payment

    const handleChange = (e) =>
        setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    // Redirect empty carts — a user landing directly on /checkout has nothing to buy
    if (!loading && cartItems.length === 0 && !placing && !paying) {
        return <Navigate to="/cart" replace />
    }

    const startPayment = async (event) => {
        event.preventDefault()
        setBackendError("")

        // Task 3 — basic client validation; do not call the backend if it fails
        const errors = validateShippingForm(address)
        setFormErrors(errors)
        if (Object.keys(errors).length > 0) return

        setPlacing(true)

        try {
            // Step 1: send ONLY the shipping address. Prices/totals are ignored
            // by the server ("totalAmount": 1 from the client never matters).
            const response = await axiosInstance.post("/orders/create-payment-order", {
                shippingAddress: address
            })

            const data = response.data
            if (!data.success) throw new Error(data.message)

            // Step 2: open the payment window (real Razorpay or built-in demo)
            await processPayment(data, address)
        } catch (err) {
            setBackendError(
                err.response?.data?.message ||
                    err.message ||
                    "Could not start checkout. Your cart is unchanged."
            )
            setPlacing(false)
        }
    }

    const processPayment = async (data, shippingAddress) => {
        setPlacing(false)
        setPaying(true)

        // DEMO MODE: no Razorpay keys configured on the backend — run the
        // built-in simulated payment window (same verification path).
        if (data.demoMode) {
            setPendingOrder(data)
            setDemoOpen(true)
            return
        }

        // REAL RAZORPAY MODE
        const loaded = await loadRazorpayScript()
        if (!loaded) {
            setPaying(false)
            setBackendError(
                "Failed to load the payment gateway. Please check your connection and try again."
            )
            return
        }

        const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            name: "ShopKart",
            description: "ShopKart Order",
            order_id: data.razorpayOrderId,

            // Step 10 — handler does NOT mean the payment is trusted; the
            // returned payment details go to the backend for signature check.
            handler: async function (response) {
                await verifyAndFinish(data.shopKartOrderId, response)
            },

            prefill: {
                name: shippingAddress.fullName,
                contact: shippingAddress.phone
            },

            theme: { color: "#2563eb" }
        }

        const paymentObject = new window.Razorpay(options)

        // Step 15 — payment failure. Cart must NOT be cleared, order stays pending.
        paymentObject.on("payment.failed", function (response) {
            console.error("Payment failed:", response.error)
            setPaying(false)
            setBackendError(
                "Payment failed. Your cart has not been cleared. Please try again."
            )
        })

        paymentObject.open()
    }

    // Built-in simulated checkout for demo mode (no Razorpay account needed).
    // "Pay now" calls the backend's demo-pay endpoint, which returns real
    // HMAC signature values that then go through the same verify-payment flow.
    const demoPayNow = async () => {
        try {
            const payRes = await axiosInstance.post("/orders/demo-pay", {
                shopKartOrderId: pendingOrder.shopKartOrderId
            })
            if (!payRes.data.success) throw new Error(payRes.data.message)

            await verifyAndFinish(pendingOrder.shopKartOrderId, {
                razorpay_order_id: payRes.data.razorpay_order_id,
                razorpay_payment_id: payRes.data.razorpay_payment_id,
                razorpay_signature: payRes.data.razorpay_signature
            })
        } catch (err) {
            setPaying(false)
            setDemoOpen(false)
            setBackendError(
                err.response?.data?.message || "Payment failed. Your cart has not been cleared."
            )
        }
    }

    const demoCancel = () => {
        setPaying(false)
        setDemoOpen(false)
        setBackendError(
            "Payment cancelled. Your cart has not been cleared. Please try again."
        )
    }

    // Step 11-14 — send payment details to backend for signature verification.
    const verifyAndFinish = async (shopKartOrderId, response) => {
        try {
            const verifyRes = await axiosInstance.post("/orders/verify-payment", {
                shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
            })

            if (!verifyRes.data.success) {
                throw new Error(verifyRes.data.message)
            }

            // Task 5 — verified payment clears the global cart state.
            // Navbar immediately shows Cart (0); no reload needed.
            clearCart()
            setPaying(false)
            setDemoOpen(false)

            navigate(`/order-success/${shopKartOrderId}`, {
                state: { justPlaced: true }
            })
        } catch (err) {
            setPaying(false)
            setDemoOpen(false)
            setBackendError(
                err.response?.data?.message ||
                    "Payment verification failed. Your cart has not been cleared."
            )
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-1">
                        {totalUnits} {totalUnits === 1 ? "item" : "items"} ready for purchase
                    </p>
                </div>

                {backendError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm font-medium">
                        {backendError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Shipping form */}
                    <form
                        className="lg:col-span-3"
                        onSubmit={startPayment}
                        noValidate
                    >
                        <CheckoutForm address={address} onChange={handleChange} />

                        {Object.keys(formErrors).length > 0 && (
                            <p className="text-sm text-red-600 mt-3 font-medium">
                                Please fix the highlighted fields before placing your order.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={placing || paying || loading}
                            className="w-full lg:w-auto mt-6 bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {placing
                                ? "Creating your order..."
                                : paying
                                  ? "Waiting for payment..."
                                  : "Place Order"}
                        </button>

                        {placing && (
                            <p className="text-xs text-gray-500 mt-2">
                                Verifying stock & prices on the server...
                            </p>
                        )}
                    </form>

                    {/* Order summary */}
                    <div className="lg:col-span-2">
                        <OrderSummary cartItems={cartItems} />
                    </div>
                </div>

                {/* DEMO checkout modal — used only when Razorpay keys are absent */}
                {demoOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">💳</span>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        ShopKart Demo Checkout
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Simulated payment window (Razorpay Test Mode equivalent)
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mb-4"></div>

                            <p className="text-sm text-gray-600 mb-1">Amount to pay</p>
                            <p className="text-2xl font-bold text-gray-900 mb-4">
                                ₹{(
                                    pendingOrder.amount / 100
                                ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2
                                })}
                            </p>

                            <button
                                onClick={demoPayNow}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 transition mb-2"
                            >
                                Pay now (simulated success)
                            </button>
                            <button
                                onClick={demoCancel}
                                className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-100 transition"
                            >
                                Cancel payment
                            </button>

                            <p className="text-[11px] text-gray-400 mt-3 text-center">
                                Payment is verified server-side via HMAC-SHA256 signature,
                                exactly like a real Razorpay payment.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Checkout
