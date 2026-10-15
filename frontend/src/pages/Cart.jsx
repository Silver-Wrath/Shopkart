import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import CartItem from "../components/CartItem"

function Cart() {
    const navigate = useNavigate()
    const { cartItems, loading, error, totalUnits, subtotal, refreshCart } = useCart()

    // 1. Loading state
    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">
                    Loading your cart...
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
                    Unable to load your cart.
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={refreshCart}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
            </div>
        )
    }

    // 3. Empty state
    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Your cart is empty
                </h2>
                <p className="text-gray-600 max-w-sm mb-6">
                    Looks like you haven't added anything yet.
                </p>
                <button
                    onClick={() => navigate("/products")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                    Browse Products
                </button>
            </div>
        )
    }

    // 4. Populated cart
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
                    <p className="text-gray-600 mt-1">
                        {totalUnits} {totalUnits === 1 ? "item" : "items"} in your cart
                    </p>
                </div>

                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <CartItem
                            key={item.product._id}
                            item={item}
                        />
                    ))}
                </div>

                {/* Order Summary — derived from cart state, never stored */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Order Summary
                    </h2>

                    <div className="flex justify-between text-gray-600 mb-2">
                        <span>Items:</span>
                        <span className="font-medium">{totalUnits}</span>
                    </div>

                    <div className="flex justify-between text-gray-900 text-lg font-bold border-t border-gray-200 pt-3">
                        <span>Subtotal:</span>
                        <span>₹{subtotal}</span>
                    </div>

                    <button
                        onClick={() => navigate("/checkout")}
                        className="w-full bg-blue-600 text-white py-3 rounded-md mt-6 font-semibold hover:bg-blue-700 transition"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Cart
