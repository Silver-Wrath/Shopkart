// Format a rupees number as ₹ with Indian digit grouping (e.g. ₹7,497)
export const formatINR = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`
}

// Format an ISO date as a readable string (e.g. "5 Oct 2026")
export const formatDate = (isoDate) => {
    if (!isoDate) return ""
    return new Date(isoDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    })
}
