import express from "express"
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
} from "../controllers/cart.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"

const router = express.Router()

// Task 2: Add product to cart (increments if already present)
router.post("/:productId", isAuthenticated, addToCart)

// Task 3: Get current user's cart (populated)
router.get("/", isAuthenticated, getCart)

// Task 4: Update quantity of a cart item
router.patch("/:productId", isAuthenticated, updateCartQuantity)

// Task 5: Remove product from cart
router.delete("/:productId", isAuthenticated, removeFromCart)

export default router
