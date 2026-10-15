import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

import customerRoutes from "./routes/customer.routes.js"
import productRoutes from "./routes/product.routes.js"
import wishlistRoutes from "./routes/wishlist.routes.js"
import Product from "./models/product.model.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env") })

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use("/customers", customerRoutes)
app.use("/products", productRoutes)
app.use("/wishlist", wishlistRoutes)

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI)
    const server = app.listen(3001)

    const baseUrl = "http://localhost:3001"
    let failed = 0
    let passed = 0

    function assert(cond, msg) {
        if (cond) {
            console.log(`✅ PASS: ${msg}`)
            passed++
        } else {
            console.error(`❌ FAIL: ${msg}`)
            failed++
        }
    }

    try {
        // Fetch a real product
        const product = await Product.findOne()
        const productId = product._id.toString()
        const fakeProductId = new mongoose.Types.ObjectId().toString()

        console.log(`\n--- Running Wishlist API Test Suite ---\nProduct ID: ${productId}`)

        // 1. Test Unauthenticated GET
        const resUnauthGet = await fetch(`${baseUrl}/wishlist`)
        assert(resUnauthGet.status === 401, "GET /wishlist without auth returns 401")

        // 2. Test Unauthenticated POST
        const resUnauthPost = await fetch(`${baseUrl}/wishlist/${productId}`, { method: "POST" })
        assert(resUnauthPost.status === 401, "POST /wishlist/:id without auth returns 401")

        // 3. Register or Login test user
        const testEmail = `testuser_${Date.now()}@shopkart.com`
        const regRes = await fetch(`${baseUrl}/customers/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: "Wishlist Tester",
                email: testEmail,
                password: "password123",
                phone: "9876543210"
            })
        })
        const regData = await regRes.json()
        assert(regRes.status === 201 && regData.success, "User registration succeeds")

        // Login to get token and cookie
        const loginRes = await fetch(`${baseUrl}/customers/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "password123"
            })
        })
        const loginData = await loginRes.json()
        const token = loginData.token
        const cookie = loginRes.headers.get("set-cookie")
        assert(Boolean(token), "Login returns JWT token")

        const authHeaders = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }

        // 4. Test Invalid product ID
        const resInvalidId = await fetch(`${baseUrl}/wishlist/invalid123`, {
            method: "POST",
            headers: authHeaders
        })
        assert(resInvalidId.status === 400, "POST /wishlist/:invalidId returns 400 Bad Request")

        // 5. Test Non-existent product ID
        const resNonExistent = await fetch(`${baseUrl}/wishlist/${fakeProductId}`, {
            method: "POST",
            headers: authHeaders
        })
        assert(resNonExistent.status === 404, "POST /wishlist/:nonExistentId returns 404 Not Found")

        // 6. Test Add Product to Wishlist (Bearer Token)
        const resAdd = await fetch(`${baseUrl}/wishlist/${productId}`, {
            method: "POST",
            headers: authHeaders
        })
        const dataAdd = await resAdd.json()
        assert(resAdd.status === 200 && dataAdd.success, "POST /wishlist/:productId returns 200 Success")

        // 7. Test Duplicate Add
        const resDup = await fetch(`${baseUrl}/wishlist/${productId}`, {
            method: "POST",
            headers: authHeaders
        })
        const dataDup = await resDup.json()
        assert(resDup.status === 409 && !dataDup.success, "POST /wishlist/:productId again returns 409 Conflict")

        // 8. Test Get Wishlist (with populated fields)
        const resGet = await fetch(`${baseUrl}/wishlist`, {
            headers: authHeaders
        })
        const dataGet = await resGet.json()
        assert(
            resGet.status === 200 &&
            dataGet.success &&
            dataGet.count === 1 &&
            dataGet.wishlist[0]._id.toString() === productId &&
            Boolean(dataGet.wishlist[0].name) &&
            Boolean(dataGet.wishlist[0].price),
            "GET /wishlist returns 200 with populated product details and correct count"
        )

        // 9. Test Cookie-based authentication
        const resGetWithCookie = await fetch(`${baseUrl}/wishlist`, {
            headers: { "Cookie": cookie }
        })
        const dataGetCookie = await resGetWithCookie.json()
        assert(resGetWithCookie.status === 200 && dataGetCookie.count === 1, "GET /wishlist works with cookie auth")

        // 10. Test Remove Product
        const resRemove = await fetch(`${baseUrl}/wishlist/${productId}`, {
            method: "DELETE",
            headers: authHeaders
        })
        const dataRemove = await resRemove.json()
        assert(resRemove.status === 200 && dataRemove.success, "DELETE /wishlist/:productId returns 200 Success")

        // 11. Test Remove Product Not In Wishlist
        const resRemoveAgain = await fetch(`${baseUrl}/wishlist/${productId}`, {
            method: "DELETE",
            headers: authHeaders
        })
        assert(resRemoveAgain.status === 404, "DELETE /wishlist/:productId when not in wishlist returns 404 Not Found")

        // 12. Test Get Wishlist Empty
        const resGetEmpty = await fetch(`${baseUrl}/wishlist`, {
            headers: authHeaders
        })
        const dataGetEmpty = await resGetEmpty.json()
        assert(resGetEmpty.status === 200 && dataGetEmpty.count === 0 && dataGetEmpty.wishlist.length === 0, "GET /wishlist returns count: 0 when empty")

        // 13. Test Bonus: Toggle Wishlist
        // Toggle on (should add)
        const resToggleOn = await fetch(`${baseUrl}/wishlist/${productId}/toggle`, {
            method: "PATCH",
            headers: authHeaders
        })
        const dataToggleOn = await resToggleOn.json()
        assert(resToggleOn.status === 200 && dataToggleOn.saved === true, "PATCH /wishlist/:productId/toggle saves product (saved: true)")

        // Toggle off (should remove)
        const resToggleOff = await fetch(`${baseUrl}/wishlist/${productId}/toggle`, {
            method: "PATCH",
            headers: authHeaders
        })
        const dataToggleOff = await resToggleOff.json()
        assert(resToggleOff.status === 200 && dataToggleOff.saved === false, "PATCH /wishlist/:productId/toggle removes product (saved: false)")

        console.log(`\nResults: ${passed} passed, ${failed} failed.`)
    } finally {
        server.close()
        await mongoose.disconnect()
    }
}

runTests()
