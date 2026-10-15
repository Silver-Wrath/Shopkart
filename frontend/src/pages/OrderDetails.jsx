import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axiosInstance from "../axiosCalls/axios"
import { formatINR, formatDate } from "../utils/format"

// Section 17 + Task 8 — Single order view. The backend enforces ownership;
// a user requesting someone else's order sees the 404 state.
function OrderDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [advancing, setAdvancing] = useState(false)

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
                    (err.response?.status === 404
                        ? "Order not found."
                        : "Unable to load this order.")
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrder()
    }, [id])

    // Bonus — progress order status: PLACED → CONFIRMED → SHIPPED → DELIVERED
    const advanceStatus = async () => {
        const next = {
            PLACED: "CONFIRMED",
            CONFIRMED: "SHIPPED",
            SHIPPED: "DELIVERED"
        }[order?.status]

        if (!next || advancing) return

        try {
            setAdvancing(true)
            const response = await axiosInstance.patch(`/orders/${order._id}/status`, {
                status: next
            })
            if (response.data.success) {
                setOrder(response.data.order)
            }
        } catch (err) {
            setError(err.response?.data?.message || "Could not update status")
        } finally {
            setAdvancing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">
                    Loading order details...
                </h2>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {error || "Order not found."}
                </h2>
                <p className="text-gray-600 mb-6">
                    This order may not exist or may belong to another user.
                </p>
                <button
                    onClick={() => navigate("/orders")}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                    Back to My Orders
                </button>
            </div>
        )
    }

    const statusColors = {
        PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
        PLACED: "bg-green-100 text-green-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        SHIPPED: "bg-purple-100 text-purple-700",
        DELIVERED: "bg-gray-200 text-gray-700"
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    to="/orders"
                    className="text-sm text-blue-600 font-medium hover:text-blue-700 mb-4 inline-block"
                >
                    ← Back to My Orders
                </Link>

                <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order #{order._id.slice(-8)}
                            </h1>
                            <p className="text-xs text-gray-500 font-mono mt-1 break-all">
                                {order._id}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>

                        <div className="text-right">
                            <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    statusColors[order.status] ||
                                    "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {order.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-2">
                                Payment: {order.paymentStatus}
                            </p>
                        </div>
                    </div>

                    {/* Items — historical purchase-time snapshot */}
                    <div className="border-t border-gray-200 pt-5">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                            Items
                        </h2>
                        <ul className="space-y-4">
                            {order.items.map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-4"
                                >
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-14 h-14 object-contain rounded-md bg-gray-50 shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatINR(item.price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900 whitespace-nowrap">
                                        {formatINR(item.price * item.quantity)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Shipping address */}
                    <div className="border-t border-gray-200 pt-5 mt-5">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                            Shipping Address
                        </h2>
                        <div className="text-sm text-gray-700 leading-relaxed">
                            <p className="font-medium">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            <p>
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state}{" "}
                                {order.shippingAddress.pincode}
                            </p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                        </div>
                    </div>

                    {/* Payment info */}
                    <div className="border-t border-gray-200 pt-5 mt-5 flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">
                                Total Amount
                            </h2>
                            {order.razorpayPaymentId && (
                                <p className="text-xs text-gray-500 font-mono break-all">
                                    Payment ID: {order.razorpayPaymentId}
                                </p>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatINR(order.totalAmount)}
                        </p>
                    </div>

                    {/* Bonus: status progression for paid orders */}
                    {order.paymentStatus === "PAID" &&
                        order.status !== "DELIVERED" && (
                            <div className="border-t border-gray-200 pt-5 mt-5">
                                <button
                                    onClick={advanceStatus}
                                    disabled={advancing}
                                    className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                >
                                    {advancing
                                        ? "Updating..."
                                        : `Advance status to ${
                                              {
                                                  PLACED: "CONFIRMED",
                                                  CONFIRMED: "SHIPPED",
                                                  SHIPPED: "DELIVERED"
                                              }[order.status]
                                          }`}
                                </button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
