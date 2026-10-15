import mongoose from "mongoose"
import Customer from "../models/customer.model.js"
import Product from "../models/product.model.js"

// Shared: populate cart items with product details
const getPopulatedCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: "cart.product",
        select: "name description price category image stock"
    })
    return customer
}

// Shared: filter out cart rows whose product was deleted
const cleanCart = (customer) => {
    return (customer.cart || []).filter((item) => item.product !== null)
}

// POST /cart/:productId - Add product to cart (or increment quantity if already present)
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        const customer = await Customer.findById(req.user._id)
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const existingItem = customer.cart.find(
            (item) => item.product.toString() === productId
        )

        const newQuantity = existingItem ? existingItem.quantity + 1 : 1

        // Stock validation
        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units available in stock`
            })
        }

        if (existingItem) {
            existingItem.quantity = newQuantity
        } else {
            customer.cart.push({ product: productId, quantity: 1 })
        }

        await customer.save()

        const updated = await getPopulatedCart(customer._id)

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: cleanCart(updated)
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// GET /cart - Get current user's cart with populated product details
export const getCart = async (req, res) => {
    try {
        const customer = await getPopulatedCart(req.user._id)

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const cart = cleanCart(customer)

        return res.status(200).json({
            success: true,
            count: cart.length,
            cart
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// PATCH /cart/:productId - Update quantity of a product already in the cart
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        if (typeof quantity !== "number" || Number.isNaN(quantity)) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a number"
            })
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            })
        }

        const customer = await Customer.findById(req.user._id)
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const item = customer.cart.find(
            (item) => item.product.toString() === productId
        )
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units available in stock`
            })
        }

        item.quantity = quantity
        await customer.save()

        const updated = await getPopulatedCart(customer._id)

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: cleanCart(updated)
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// DELETE /cart/:productId - Remove a product from the cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        const customer = await Customer.findById(req.user._id)
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const exists = customer.cart.some(
            (item) => item.product.toString() === productId
        )
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            })
        }

        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        )
        await customer.save()

        const updated = await getPopulatedCart(customer._id)

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: cleanCart(updated)
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}
