import express from "express"
import {
    createPaymentOrderController,
    verifyPaymentController,
    demoPayController,
    getOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/order.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"

const router = express.Router()

// Task 4: create pending ShopKart order + Razorpay Order
router.post("/create-payment-order", isAuthenticated, createPaymentOrderController)

// Task 5: verify Razorpay signature and confirm the order
router.post("/verify-payment", isAuthenticated, verifyPaymentController)

// Dev-only simulated payment (inactive when real Razorpay keys are configured)
router.post("/demo-pay", isAuthenticated, demoPayController)

// Bonus: status progression endpoint
router.patch("/:id/status", isAuthenticated, updateOrderStatus)

// Task 7: current user's orders (newest first)
router.get("/", isAuthenticated, getOrders)

// Section 17: single order with ownership enforcement
router.get("/:id", isAuthenticated, getOrderById)

export default router
