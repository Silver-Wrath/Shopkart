import mongoose from "mongoose"
import Customer from "../models/customer.model.js"
import Product from "../models/product.model.js"

// POST /wishlist/:productId - Add a product to the authenticated user's wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        // Check if product exists in database
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        // Find the authenticated user
        const customer = await Customer.findById(req.user._id)
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Prevent duplicates
        const alreadyInWishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        )

        if (alreadyInWishlist) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            })
        }

        // Add to wishlist
        customer.wishlist.push(productId)
        await customer.save()

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// GET /wishlist - Get current authenticated user's wishlist populated with product details
export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name description price category image stock"
        })

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Filter out any referenced products that may have been deleted
        const wishlist = (customer.wishlist || []).filter(item => item !== null)

        return res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// DELETE /wishlist/:productId - Remove a product from authenticated user's wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        // Validate productId
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

        const existsInWishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        )

        if (!existsInWishlist) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            })
        }

        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        )
        await customer.save()

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

// PATCH /wishlist/:productId/toggle - Bonus: Toggle product in wishlist
export const toggleWishlist = async (req, res) => {
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

        const index = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        )

        if (index !== -1) {
            // Already saved: remove it
            customer.wishlist.splice(index, 1)
            await customer.save()

            return res.status(200).json({
                success: true,
                message: "Product removed from wishlist",
                saved: false
            })
        } else {
            // Not saved: add it
            customer.wishlist.push(productId)
            await customer.save()

            return res.status(200).json({
                success: true,
                message: "Product added to wishlist",
                saved: true
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}
