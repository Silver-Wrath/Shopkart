import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../axiosCalls/axios"
import { useCart } from "../context/CartContext"

function ProductCard({ product, initialWishlisted = false }) {
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const [isWishlisted, setIsWishlisted] = useState(initialWishlisted)
    const [saving, setSaving] = useState(false)
    const [adding, setAdding] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    // Keep the heart in sync when the wishlist loads after the card has mounted
    useEffect(() => {
        setIsWishlisted(initialWishlisted)
    }, [initialWishlisted])

    const handleWishlistClick = async (e) => {
        e.stopPropagation()
        if (saving) return

        setSaving(true)
        setErrorMessage("")

        try {
            if (!isWishlisted) {
                // Add to wishlist
                const response = await axiosInstance.post(`/wishlist/${product._id}`)
                if (response.data.success) {
                    setIsWishlisted(true)
                    window.dispatchEvent(new Event("wishlistUpdated"))
                }
            } else {
                // Remove from wishlist (Bonus toggle)
                const response = await axiosInstance.delete(`/wishlist/${product._id}`)
                if (response.data.success) {
                    setIsWishlisted(false)
                    window.dispatchEvent(new Event("wishlistUpdated"))
                }
            }
        } catch (err) {
            // Handle edge case where product was already in wishlist (409)
            if (err.response?.status === 409) {
                setIsWishlisted(true)
            } else {
                setErrorMessage(err.response?.data?.message || "Unable to save product. Please try again.")
            }
        } finally {
            setSaving(false)
        }
    }

    const handleAddToCart = async () => {
        if (adding) return
        setAdding(true)
        setErrorMessage("")
        try {
            await addToCart(product._id)
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "Unable to add to cart. Please try again.")
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition relative">
            <div>
                {/* Heart button on top right of image */}
                <div className="relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-contain rounded-md mb-4 bg-gray-50"
                    />
                    <button
                        onClick={handleWishlistClick}
                        disabled={saving}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition ${
                            isWishlisted
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white"
                        }`}
                    >
                        <span className="text-xl leading-none">
                            {isWishlisted ? "♥" : "♡"}
                        </span>
                    </button>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {product.category}
                </span>

                <h2 className="text-xl font-semibold mt-2 line-clamp-1" title={product.name}>
                    {product.name}
                </h2>

                <p className="text-blue-600 font-bold text-lg mt-2">
                    ₹{product.price}
                </p>

                <p className="text-gray-600 mt-2 text-sm">
                    {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
                </p>

                {errorMessage && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                        {errorMessage}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 font-medium transition text-sm text-center"
                >
                    View Details
                </button>

                <button
                    onClick={handleAddToCart}
                    disabled={adding || product.stock === 0}
                    className={`w-full py-2 px-2 rounded-md font-medium text-sm transition flex items-center justify-center gap-1 ${
                        product.stock === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : adding
                            ? "bg-blue-400 text-white cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                    {product.stock === 0 ? (
                        <>Out of Stock</>
                    ) : adding ? (
                        <>
                            <span>⏳</span> Adding...
                        </>
                    ) : (
                        <>
                            <span>🛒</span> Add to Cart
                        </>
                    )}
                </button>

                <button
                    onClick={handleWishlistClick}
                    disabled={saving}
                    className={`col-span-2 w-full py-2 px-2 rounded-md font-medium text-sm transition flex items-center justify-center gap-1 ${
                        saving
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isWishlisted
                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            : "bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50"
                    }`}
                >
                    {saving ? (
                        <>
                            <span>⏳</span> Saving...
                        </>
                    ) : isWishlisted ? (
                        <>
                            <span>♥</span> Added to Wishlist
                        </>
                    ) : (
                        <>
                            <span>♡</span> Add to Wishlist
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default ProductCard