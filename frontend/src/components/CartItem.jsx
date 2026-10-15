import { useState } from "react"
import { useCart } from "../context/CartContext"

function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart()
    const product = item.product
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    const changeQuantity = async (newQuantity) => {
        if (busy) return
        setBusy(true)
        setError("")
        try {
            await updateQuantity(product._id, newQuantity)
        } catch (err) {
            setError(err.response?.data?.message || "Could not update quantity")
        } finally {
            setBusy(false)
        }
    }

    const handleRemove = async () => {
        if (busy) return
        setBusy(true)
        setError("")
        try {
            await removeFromCart(product._id)
        } catch (err) {
            setError(err.response?.data?.message || "Could not remove item")
            setBusy(false)
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex gap-4">
            <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 object-contain rounded-md bg-gray-50 shrink-0"
            />

            <div className="flex-1">
                <div className="flex justify-between gap-4">
                    <div>
                        <h2 className="font-semibold text-gray-900 line-clamp-1" title={product.name}>
                            {product.name}
                        </h2>
                        <p className="text-blue-600 font-bold mt-1">
                            ₹{product.price}
                        </p>
                    </div>

                    <p className="font-bold text-gray-900 whitespace-nowrap">
                        ₹{product.price * item.quantity}
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-3">
                    {/* Decrease: disabled at quantity 1 — use Remove instead */}
                    <button
                        onClick={() => changeQuantity(item.quantity - 1)}
                        disabled={busy || item.quantity <= 1}
                        className="w-8 h-8 rounded-md border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        −
                    </button>

                    <span className="font-semibold w-6 text-center">
                        {busy ? "…" : item.quantity}
                    </span>

                    {/* Increase: disabled at stock limit */}
                    <button
                        onClick={() => changeQuantity(item.quantity + 1)}
                        disabled={busy || item.quantity >= product.stock}
                        title={item.quantity >= product.stock ? "Stock limit reached" : ""}
                        className="w-8 h-8 rounded-md border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        +
                    </button>

                    <button
                        onClick={handleRemove}
                        disabled={busy}
                        className="ml-4 text-sm text-red-600 font-medium hover:text-red-700 disabled:opacity-50 transition"
                    >
                        {busy ? "Working…" : "Remove"}
                    </button>
                </div>

                {product.stock <= 5 && (
                    <p className="text-xs text-orange-600 mt-2">
                        Only {product.stock} left in stock
                    </p>
                )}

                {error && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
}

export default CartItem
