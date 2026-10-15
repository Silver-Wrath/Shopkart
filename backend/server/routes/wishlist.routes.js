import express from "express"
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist
} from "../controllers/wishlist.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"

const router = express.Router()

// Task 2: Add product to wishlist
router.post("/:productId", isAuthenticated, addToWishlist)

// Task 3: Get current user's wishlist
router.get("/", isAuthenticated, getWishlist)

// Task 4: Remove product from wishlist
router.delete("/:productId", isAuthenticated, removeFromWishlist)

// Task 23 (Bonus): Toggle wishlist
router.patch("/:productId/toggle", isAuthenticated, toggleWishlist)
router.patch("/toggle/:productId", isAuthenticated, toggleWishlist)

export default router
