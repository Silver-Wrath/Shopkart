import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../axiosCalls/axios"

function WishlistCard({ product, onRemove }) {
    const navigate = useNavigate()
    const [removing, setRemoving] = useState(false)
    const [error, setError] = useState("")

    const handleRemove = async () => {
        try {
            setRemoving(true)
            setError("")
            const response = await axiosInstance.delete(`/wishlist/${product._id}`)
            if (response.data.success) {
                window.dispatchEvent(new Event("wishlistUpdated"))
                onRemove(product._id)
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove product")
        } finally {
            setRemoving(false)
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-contain rounded-md mb-4 bg-gray-50"
                />

                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {product.category}
                </span>

                <h2 className="text-lg font-semibold text-gray-900 mt-2 line-clamp-1" title={product.name}>
                    {product.name}
                </h2>

                <p className="text-blue-600 font-bold text-xl mt-2">
                    ₹{product.price}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                    {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
                </p>

                {error && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                        {error}
                    </p>
                )}
            </div>

            <div className="mt-5 space-y-2">
                <button
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition"
                >
                    View Details
                </button>

                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className={`w-full py-2 px-4 rounded-md font-medium border transition flex items-center justify-center gap-1.5 ${
                        removing
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    }`}
                >
                    {removing ? (
                        <>
                            <span>⏳</span> Removing...
                        </>
                    ) : (
                        <>
                            <span>🗑️</span> Remove from Wishlist
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default WishlistCard
