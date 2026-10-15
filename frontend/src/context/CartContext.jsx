import { createContext, useContext, useEffect, useState, useCallback } from "react"
import axiosInstance from "../axiosCalls/axios"
import { useAuth } from "./AuthContext"

const CartContext = createContext()

// Derived values are always calculated from cartItems — never stored
const deriveTotals = (cartItems) => {
    const totalUnits = cartItems.reduce(
        (sum, item) => sum + (item.product ? item.quantity : 0),
        0
    )
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product ? item.product.price * item.quantity : 0),
        0
    )
    return { totalUnits, subtotal }
}

export const CartProvider = ({ children }) => {
    const { user } = useAuth()
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const { totalUnits, subtotal } = deriveTotals(cartItems)

    const refreshCart = useCallback(async () => {
        if (!user) {
            setCartItems([])
            return
        }
        try {
            setLoading(true)
            setError("")
            const response = await axiosInstance.get("/cart")
            if (response.data.success) {
                setCartItems(response.data.cart || [])
            }
        } catch {
            setError("Unable to load your cart.")
        } finally {
            setLoading(false)
        }
    }, [user])

    // Load cart on login, clear it on logout
    useEffect(() => {
        refreshCart()
    }, [refreshCart])

    const addToCart = useCallback(async (productId) => {
        const response = await axiosInstance.post(`/cart/${productId}`)
        if (response.data.success) {
            setCartItems(response.data.cart || [])
            return response.data
        }
        throw new Error(response.data.message || "Failed to add to cart")
    }, [])

    const updateQuantity = useCallback(async (productId, quantity) => {
        const response = await axiosInstance.patch(`/cart/${productId}`, { quantity })
        if (response.data.success) {
            setCartItems(response.data.cart || [])
            return response.data
        }
        throw new Error(response.data.message || "Failed to update quantity")
    }, [])

    const removeFromCart = useCallback(async (productId) => {
        const response = await axiosInstance.delete(`/cart/${productId}`)
        if (response.data.success) {
            setCartItems(response.data.cart || [])
            return response.data
        }
        throw new Error(response.data.message || "Failed to remove item")
    }, [])

    // Task 5 — clear global cart state after verified payment.
    // Backend has already emptied the DB cart; this syncs the UI immediately
    // (Navbar shows Cart (0)) without waiting for a refetch or page reload.
    const clearCart = useCallback(() => {
        setCartItems([])
    }, [])

    return (
        <CartContext.Provider
            value={{
                cartItems,
                loading,
                error,
                totalUnits,
                subtotal,
                refreshCart,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    return useContext(CartContext)
}
