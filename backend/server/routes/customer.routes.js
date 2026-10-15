import express from "express"
import { registerUser, loginUser, getMyProfile, logoutUser } from "../controllers/customer.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", registerUser)

router.post("/login", loginUser)

router.get("/me", isAuthenticated, getMyProfile)

router.post("/logout", isAuthenticated, logoutUser)

export default router