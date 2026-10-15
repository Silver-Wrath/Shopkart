import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../axiosCalls/axios"

function Login() {
    const navigate = useNavigate()
    const { getUser } = useAuth()

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const [error, setError] = useState("")

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!formData.email || !formData.password) {
            setError("Invalid Credentials")
            return
        }

        try {
            await axiosInstance.post(
                "/customers/login",
                formData
            )

            await getUser()
            navigate("/home")
        } catch (error) {
            setError("Invalid Credentials")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">
                        ShopKart
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Welcome back
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm"
                >

                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Login
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 mb-5">
                            {error}
                        </div>
                    )}

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Your password"
                            className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                        Login
                    </button>

                    <p className="text-center text-gray-600 mt-6">
                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Register
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    )
}

export default Login