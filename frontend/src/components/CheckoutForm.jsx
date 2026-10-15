import { useState } from "react"

// Task 3 — shipping form with field-level validation.
// Whitespace-only input is invalid, phone must be numeric,
// pincode must contain exactly 6 digits.
function CheckoutForm({ address, onChange }) {
    const [errors, setErrors] = useState({})

    const validateField = (name, value) => {
        const v = value.trim()

        switch (name) {
            case "fullName":
                if (!v) return "Full name is required"
                return ""
            case "phone":
                if (!v) return "Phone is required"
                if (!/^(\+?\d{10,13})$/.test(v)) return "Phone must be a valid number (10-13 digits)"
                return ""
            case "addressLine1":
                if (!v) return "Address is required"
                return ""
            case "city":
                if (!v) return "City is required"
                return ""
            case "state":
                if (!v) return "State is required"
                return ""
            case "pincode":
                if (!v) return "Pincode is required"
                if (!/^\d{6}$/.test(v)) return "Pincode must contain 6 digits"
                return ""
            default:
                return ""
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }

    const handleChange = (e) => {
        onChange(e)
        // Clear the error as the user fixes the field
        if (errors[e.target.name]) {
            setErrors((prev) => ({ ...prev, [e.target.name]: "" }))
        }
    }

    const fields = [
        { name: "fullName", label: "Full Name", type: "text", placeholder: "Aarav Sharma" },
        { name: "phone", label: "Phone", type: "tel", placeholder: "9876543210" },
        { name: "addressLine1", label: "Address Line 1", type: "text", placeholder: "22 MG Road" },
        { name: "city", label: "City", type: "text", placeholder: "Bengaluru" },
        { name: "state", label: "State", type: "text", placeholder: "Karnataka" },
        { name: "pincode", label: "Pincode", type: "text", maxLength: 6, placeholder: "560001" }
    ]

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
                Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div
                        key={field.name}
                        className={field.name === "addressLine1" ? "sm:col-span-2" : ""}
                    >
                        <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            {field.label}
                        </label>
                        <input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            maxLength={field.maxLength}
                            value={address[field.name] || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 transition ${
                                errors[field.name]
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        {errors[field.name] && (
                            <p className="text-xs text-red-600 mt-1 font-medium">
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CheckoutForm
