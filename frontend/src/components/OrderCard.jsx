import { useNavigate } from "react-router-dom"
import { formatINR, formatDate } from "../utils/format"

// Task 8 — a single order card in the My Orders list.
function OrderCard({ order }) {
    const navigate = useNavigate()

    const statusColors = {
        PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
        PLACED: "bg-green-100 text-green-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        SHIPPED: "bg-purple-100 text-purple-700",
        DELIVERED: "bg-gray-200 text-gray-700"
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                    <h2 className="font-bold text-gray-900">
                        Order #{order._id.slice(-8)}
                    </h2>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {order._id}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {formatDate(order.createdAt)}
                    </p>
                </div>

                <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-600"
                    }`}
                >
                    {order.status}
                </span>
            </div>

            <ul className="space-y-1 text-sm text-gray-700 mb-4">
                {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between gap-4">
                        <span className="truncate">
                            {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                            {formatINR(item.price * item.quantity)}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold text-gray-900">
                        {formatINR(order.totalAmount)}
                    </p>
                </div>

                <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
                >
                    View Details
                </button>
            </div>
        </div>
    )
}

export default OrderCard
