import mongoose from "mongoose"
import Product from "../models/product.model.js"

// Escape user input so characters like ( [ + * cannot break the $regex query
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body

        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !image ||
            stock === undefined
        ) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        })

        res.status(201).json({
            success: true,
            product
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query

        const filter = {}

        if (search) {
            filter.name = {
                $regex: escapeRegex(search.trim()),
                $options: "i"
            }
        }

        if (category) {
            filter.category = category
        }

        let query = Product.find(filter)

        if (sort === "price_asc") {
            query = query.sort({ price: 1 })
        }

        if (sort === "price_desc") {
            query = query.sort({ price: -1 })
        }

        const products = await query

        res.status(200).json({
            success: true,
            count: products.length,
            products
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getProduct = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            })
        }

        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        res.status(200).json({
            success: true,
            product
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}