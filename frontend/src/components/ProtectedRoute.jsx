import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "./Navbar"

function ProtectedRoute() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
                <h1 className="text-3xl font-black">
                    LOADING...
                </h1>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}

export default ProtectedRoute