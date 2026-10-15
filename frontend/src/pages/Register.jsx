import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axiosInstance from "../axiosCalls/axios"

function Register() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: ""
    })

    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError("")

        if (
            !formData.fullName ||
            !formData.email ||
            !formData.password ||
            !formData.phone
        ) {
            setError("All fields are required")
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        try {
            await axiosInstance.post(
                "/customers/register",
                formData
            )

            setSuccess(true)

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            )
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">
                        ShopKart
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Create your account
                    </p>
                </div>

                {success ? (

                    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">

                        <div className="text-5xl mb-5">
                            ✓
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                            Account Created
                        </h2>

                        <p className="text-gray-600 mb-7">
                            Your ShopKart account has been created successfully.
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                        >
                            Go to Login
                        </button>

                    </div>

                ) : (

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm"
                    >

                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Create Account
                        </h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 mb-5">
                                {error}
                            </div>
                        )}

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Your Name"
                                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

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

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="9876543210"
                                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                        >
                            Create Account
                        </button>

                        <p className="text-center text-gray-600 mt-6">
                            Already have an account?{" "}

                            <Link
                                to="/login"
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Login
                            </Link>
                        </p>

                    </form>

                )}

            </div>

        </div>
    )
}

export default Register