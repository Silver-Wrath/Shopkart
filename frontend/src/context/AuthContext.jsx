import { createContext, useContext, useEffect, useState } from "react"
import axiosInstance from "../axiosCalls/axios"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const getUser = async () => {
        try {
            const response = await axiosInstance.get("/customers/me")
            setUser(response.data)
        } catch (error) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getUser()
    }, [])

    const logout = async () => {
        try {
            await axiosInstance.post("/customers/logout")
        } catch (error) {
            console.log(error)
        } finally {
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                logout,
                getUser
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}