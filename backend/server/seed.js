import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import Product from "./models/product.model.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, ".env") })
dotenv.config()

const sampleProducts = [
    {
        name: "Mechanical Keyboard",
        description: "Custom mechanical keyboard with RGB backlighting, hot-swappable switches, and aluminum casing.",
        price: 2999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
        stock: 10
    },
    {
        name: "Noise Cancelling Headphones",
        description: "Premium over-ear wireless headphones with active noise cancellation and 30-hour battery life.",
        price: 4999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        stock: 12
    },
    {
        name: "Wireless Gaming Mouse",
        description: "Ultra-lightweight wireless optical gaming mouse with 25K DPI sensor and PTFE feet.",
        price: 1899,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60",
        stock: 25
    },
    {
        name: "Ergonomic Desk Chair",
        description: "Breathable mesh ergonomic office chair with adjustable lumbar support and 3D armrests.",
        price: 8499,
        category: "Furniture",
        image: "https://images.unsplash.com/photo-1580481077195-c990b7952670?w=500&auto=format&fit=crop&q=60",
        stock: 7
    },
    {
        name: "Minimalist Leather Backpack",
        description: "Water-resistant genuine leather laptop backpack with multiple organizing compartments.",
        price: 3499,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
        stock: 15
    },
    {
        name: "Stainless Steel Smart Bottle",
        description: "Insulated temperature-sensing stainless steel water bottle with LED touch display.",
        price: 1299,
        category: "Lifestyle",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60",
        stock: 40
    }
]

export const seedDatabase = async ({ connect = true, disconnect = true } = {}) => {
    try {
        if (connect) {
            await mongoose.connect(process.env.MONGO_URI)
            console.log("Connected to MongoDB for seeding")
        }

        const count = await Product.countDocuments()
        if (count === 0) {
            await Product.insertMany(sampleProducts)
            console.log(`Seeded ${sampleProducts.length} sample products successfully!`)
        } else {
            console.log(`Database already has ${count} products. Skipping seeding.`)
        }
    } catch (error) {
        console.error("Seeding failed:", error)
    } finally {
        if (disconnect) {
            await mongoose.disconnect()
        }
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seedDatabase()
}
