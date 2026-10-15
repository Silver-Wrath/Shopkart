import { formatINR } from "../utils/format"

// Order summary rendered on the Checkout page — final review of the cart
// before payment. Totals come from cart state; the backend recalculates
// the authoritative total server-side anyway (Section 11).
function OrderSummary({ cartItems }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
            </h2>

            <div className="space-y-3">
                {cartItems.map((item) => (
                    <div
                        key={item.product._id}
                        className="flex justify-between text-gray-700"
                    >
                        <span className="truncate pr-4">
                            {item.product.name} × {item.quantity}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                            {formatINR(item.product.price * item.quantity)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between text-gray-900 text-lg font-bold border-t border-gray-200 pt-3 mt-4">
                <span>Total</span>
                <span>
                    {formatINR(
                        cartItems.reduce(
                            (sum, item) => sum + item.product.price * item.quantity,
                            0
                        )
                    )}
                </span>
            </div>

            <p className="text-xs text-gray-500 mt-3">
                Final total is recalculated and verified on the server at Checkout.
            </p>
        </div>
    )
}

export default OrderSummary
