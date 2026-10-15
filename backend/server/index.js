import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import customerRoutes from "./routes/customer.routes.js"
import productRoutes from "./routes/product.routes.js"
import wishlistRoutes from "./routes/wishlist.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import orderRoutes from "./routes/order.routes.js"
import { MongoMemoryServer } from "mongodb-memory-server"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, ".env") })
dotenv.config()

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/customers", customerRoutes)
app.use("/products", productRoutes)
app.use("/wishlist", wishlistRoutes)
app.use("/cart", cartRoutes)
app.use("/orders", orderRoutes)

// Connect to MongoDB. If MONGO_URI (e.g. MongoDB Atlas) is unreachable from
// this environment, fall back to a local in-memory MongoDB so the app still
// runs end-to-end with the same Mongoose models.
const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000
        })
        console.log("MongoDB connected (Atlas)")
    } catch (err) {
        console.log("MongoDB connection failed:", err.message)
        console.log("Falling back to local in-memory MongoDB...")

        const memServer = await MongoMemoryServer.create({
            binary: {
                version: process.env.MEMORY_MONGO_VERSION || "7.0.14",
                // Parrot/derivative systems report odd VERSION_IDs, which defeats
                // distro detection. Pin a Debian release that MongoDB ships builds for.
                os: {
                    os: "linux",
                    dist: "debian",
                    release: "12"
                }
            }
        })
        await mongoose.connect(memServer.getUri("shopkart"))
        console.log("MongoDB connected (local in-memory at", memServer.getUri("shopkart") + ")")

        // Seed sample products into the fresh database
        try {
            const seed = await import("./seed.js")
            await seed.seedDatabase({ connect: false, disconnect: false })
        } catch (seedErr) {
            console.log("Seeding skipped:", seedErr.message)
        }
    }
}

connectDatabase()

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})