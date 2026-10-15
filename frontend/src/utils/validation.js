// Task 3 — form validation shared by CheckoutForm (real-time) and Checkout
// (submit-time). An empty returned object means the form is valid, and the
// backend must never be called while errors remain.
export const validateShippingForm = (address) => {
    const errors = {}
    const check = (name, cond, msg) => {
        if (cond) errors[name] = msg
    }

    const isBlank = (v) => !v || v.trim().length === 0
    const value = (name) => (address?.[name] || "").trim()

    check("fullName", isBlank(address?.fullName), "Full name is required")
    check("phone", isBlank(address?.phone), "Phone is required")
    check(
        "phone",
        !isBlank(address?.phone) &&
            !/^(\+?\d{10,13})$/.test(value("phone")),
        "Phone must be a valid number (10-13 digits)"
    )
    check("addressLine1", isBlank(address?.addressLine1), "Address is required")
    check("city", isBlank(address?.city), "City is required")
    check("state", isBlank(address?.state), "State is required")
    check("pincode", isBlank(address?.pincode), "Pincode is required")
    check(
        "pincode",
        !isBlank(address?.pincode) &&
            !/^\d{6}$/.test(value("pincode")),
        "Pincode must contain 6 digits"
    )

    return errors
}
