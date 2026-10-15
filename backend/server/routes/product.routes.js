import express from "express"
import {
    createProduct,
    getProducts,
    getProduct
} from "../controllers/product.controller.js"

const router = express.Router()

router.post("/", createProduct)
router.get("/", getProducts)
router.get("/:id", getProduct)

export default router