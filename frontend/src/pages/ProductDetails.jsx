import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axiosInstance from "../axiosCalls/axios"

function ProductDetails() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const getProduct = async () => {
        try {
            const response = await axiosInstance.get(`/products/${id}`)
            setProduct(response.data.product)
        } catch (error) {
            setError("Something went wrong while loading the product.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getProduct()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-semibold">
                    Loading product...
                </h1>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-semibold text-red-600">
                    {error}
                </h1>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-semibold">
                    Product not found.
                </h1>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <button
                onClick={() => navigate("/products")}
                className="text-blue-600 font-semibold mb-6"
            >
                ← Back to Products
            </button>

            <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div>
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-96 object-contain rounded-lg"
                        />
                    </div>

                    <div>
                        <p className="text-blue-600 font-medium">
                            {product.category}
                        </p>

                        <h1 className="text-3xl font-bold mt-2">
                            {product.name}
                        </h1>

                        <p className="text-2xl font-bold text-blue-600 mt-4">
                            ₹{product.price}
                        </p>

                        <p className="text-gray-600 mt-6">
                            {product.description}
                        </p>

                        <p className="text-gray-700 font-medium mt-6">
                            Stock: {product.stock} units
                        </p>

                        <button
                            className="w-full bg-blue-600 text-white py-3 rounded-md mt-8 font-semibold hover:bg-blue-700"
                        >
                            Add to Cart
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProductDetails