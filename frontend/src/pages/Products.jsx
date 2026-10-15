import { useEffect, useState } from "react"
import axiosInstance from "../axiosCalls/axios"
import ProductCard from "../components/ProductCard"
import SearchBar from "../components/SearchBar"

function Products() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [wishlistIds, setWishlistIds] = useState(new Set())
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const getWishlist = async () => {
        try {
            const res = await axiosInstance.get("/wishlist")
            if (res.data.success && res.data.wishlist) {
                setWishlistIds(new Set(res.data.wishlist.map((p) => p._id)))
            }
        } catch {
            // Ignore if wishlist fetch fails here
        }
    }

    const getProducts = async (signal) => {
        try {
            setLoading(true)
            setError("")

            const response = await axiosInstance.get("/products", {
                params: {
                    search,
                    category
                },
                signal
            })

            setProducts(response.data.products)
            setLoading(false)
        } catch (err) {
            // Request was superseded by a newer one — keep showing current results
            if (err.name === "CanceledError" || err.name === "AbortError") return
            setError("Something went wrong while loading products.")
            setLoading(false)
        }
    }

    // Fetch category options from the catalog so the dropdown matches real data
    const getCategories = async () => {
        try {
            const response = await axiosInstance.get("/products")
            const cats = [...new Set(response.data.products.map((p) => p.category))]
            setCategories(cats.sort())
        } catch {
            // Non-critical: dropdown just stays empty
        }
    }

    // Debounce search input so we don't hit the API on every keystroke
    useEffect(() => {
        const controller = new AbortController()
        const timer = setTimeout(() => {
            getProducts(controller.signal)
        }, 300)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [search, category])

    useEffect(() => {
        getWishlist()
        getCategories()
    }, [])

    useEffect(() => {
        const handleWishlistUpdated = () => {
            getWishlist()
        }
        window.addEventListener("wishlistUpdated", handleWishlistUpdated)
        return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdated)
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-8">

            <h1 className="text-3xl font-bold text-blue-600 mb-8">
                Products
            </h1>

            <SearchBar
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                categories={categories}
            />

            {loading && (
                <div className="flex justify-center py-10">
                    <h2 className="text-2xl font-semibold">
                        Loading products...
                    </h2>
                </div>
            )}

            {!loading && error && (
                <div className="flex justify-center py-10">
                    <h2 className="text-2xl font-semibold text-red-600">
                        {error}
                    </h2>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="flex justify-center py-10">
                    <h2 className="text-2xl font-semibold">
                        No products found.
                    </h2>
                </div>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            initialWishlisted={wishlistIds.has(product._id)}
                        />
                    ))}
                </div>
            )}

        </div>
    )
}

export default Products
