import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../axiosCalls/axios"
import WishlistCard from "../components/WishlistCard"

function Wishlist() {
    const navigate = useNavigate()
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchWishlist = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axiosInstance.get("/wishlist")
            if (response.data.success) {
                setWishlist(response.data.wishlist || [])
            }
        } catch (err) {
            setError("We couldn't load your wishlist.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [])

    const handleRemoveProduct = (removedId) => {
        setWishlist((prev) => prev.filter((item) => item._id !== removedId))
    }

    // 1. Loading State (Task 7, Section 10)
    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">
                    Loading your wishlist...
                </h2>
            </div>
        )
    }

    // 2. Error State (Task 7, Section 11)
    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong.
                </h2>
                <p className="text-gray-600 mb-6">
                    {error}
                </p>
                <button
                    onClick={fetchWishlist}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
            </div>
        )
    }

    // 3. Empty State (Task 7, Section 9)
    if (wishlist.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-4 animate-pulse">❤️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Your wishlist is empty
                </h2>
                <p className="text-gray-600 max-w-sm mb-6">
                    Save products you love and find them here later.
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

    // 4. Populated Wishlist State (Task 6, Section 6)
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Wishlist
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <WishlistCard
                            key={product._id}
                            product={product}
                            onRemove={handleRemoveProduct}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Wishlist
