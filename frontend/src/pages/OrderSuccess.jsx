import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axiosInstance from "../axiosCalls/axios"
import { formatINR } from "../utils/format"

// Task 6 — order confirmation screen shown after verified payment.
function OrderSuccess() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true)
                setError("")
                const response = await axiosInstance.get(`/orders/${id}`)

                if (!response.data.success) throw new Error(response.data.message)
                setOrder(response.data.order)
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Could not load the order."
                )
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">
                    Loading your order...
                </h2>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
                <button
                    onClick={() => navigate("/orders")}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                    View My Orders
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-lg mx-auto">
                <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Order Placed Successfully
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Your order has been saved successfully.
                    </p>

                    <div className="bg-gray-50 rounded-md p-5 text-left space-y-3">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Order ID
                            </p>
                            <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                                {order._id}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Total Paid
                            </p>
                            <p className="font-bold text-gray-900 text-lg">
                                {formatINR(order.totalAmount)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Status
                            </p>
                            <p className="font-semibold text-gray-900">
                                {order.status}{" "}
                                <span className="text-green-600">
                                    ({order.paymentStatus})
                                </span>
                            </p>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                Items
                            </p>
                            <ul className="space-y-1.5">
                                {order.items.map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between text-sm text-gray-700"
                                    >
                                        <span>
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium">
                                            {formatINR(item.price * item.quantity)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8">
                        <button
                            onClick={() => navigate("/orders")}
                            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md font-semibold hover:bg-blue-700 transition"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate("/products")}
                            className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-md font-medium hover:bg-gray-100 transition"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderSuccess
