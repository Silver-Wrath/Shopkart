import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import axiosInstance from "../axiosCalls/axios"

function Navbar() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const { totalUnits } = useCart()
    const [wishlistCount, setWishlistCount] = useState(0)

    const fetchWishlistCount = async () => {
        if (!user) return
        try {
            const response = await axiosInstance.get("/wishlist")
            if (response.data.success) {
                setWishlistCount(response.data.count || 0)
            }
        } catch {
            // Keep count as is or 0
        }
    }

    useEffect(() => {
        fetchWishlistCount()

        const handleWishlistUpdated = () => {
            fetchWishlistCount()
        }

        window.addEventListener("wishlistUpdated", handleWishlistUpdated)
        return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdated)
    }, [user])

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

                <Link
                    to="/home"
                    className="text-2xl font-bold text-blue-600 flex items-center gap-2"
                >
                    <span>🛍️</span> ShopKart
                </Link>

                <div className="flex items-center gap-6">

                    <Link
                        to="/home"
                        className="text-gray-700 font-medium hover:text-blue-600 transition"
                    >
                        Home
                    </Link>

                    <Link
                        to="/products"
                        className="text-gray-700 font-medium hover:text-blue-600 transition"
                    >
                        Products
                    </Link>

                    <Link
                        to="/wishlist"
                        className="text-gray-700 font-medium hover:text-blue-600 transition flex items-center gap-1"
                    >
                        <span>Wishlist</span>
                        {wishlistCount > 0 && (
                            <span className="font-semibold text-blue-600">
                                ({wishlistCount})
                            </span>
                        )}
                    </Link>

                    <Link
                        to="/cart"
                        className="text-gray-700 font-medium hover:text-blue-600 transition flex items-center gap-1"
                    >
                        <span>Cart</span>
                        {totalUnits > 0 && (
                            <span className="font-semibold text-blue-600">
                                ({totalUnits})
                            </span>
                        )}
                    </Link>

                    <Link
                        to="/orders"
                        className="text-gray-700 font-medium hover:text-blue-600 transition"
                    >
                        Orders
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                        Logout
                    </button>

                </div>
            </div>
        </nav>
    )
}

export default Navbar