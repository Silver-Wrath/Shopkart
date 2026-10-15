import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../axiosCalls/axios"
import OrderCard from "../components/OrderCard"

// Task 8 — My Orders page with loading, empty and error states.
function Orders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axiosInstance.get("/orders")

            if (!response.data.success) throw new Error(response.data.message)
            setOrders(response.data.orders || [])
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Unable to load your orders."
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // 1. Loading state
    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">
                    Loading your orders...
                </h2>
            </div>
        )
    }

    // 2. Error state
    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Unable to load your orders.
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={fetchOrders}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
            </div>
        )
    }

    // 3. Empty state
    if (orders.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    You have not placed any orders yet.
                </h2>
                <p className="text-gray-600 max-w-sm mb-6">
                    When you place an order, it will appear here.
                </p>
                <button
                    onClick={() => navigate("/products")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                    Start Shopping
                </button>
            </div>
        )
    }

    // 4. Populated orders list (newest first, sorted by the API)
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-1">
                        {orders.length} {orders.length === 1 ? "order" : "orders"} placed
                    </p>
                </div>

                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderCard key={order._id} order={order} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Orders
