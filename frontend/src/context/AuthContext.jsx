import { useEffect, useState } from "react"
import api from "../api/axios.js"
import { AuthContext } from "./AuthContextInstance.jsx";

export function AuthProvider({children}){
    const [user,setUser]=useState(null)
    const [loading,setLoading]=useState(true)

    const logout=async()=>{
        try{
            await api.post('/users/logout')
        }catch(e){
            console.warn("Logout request failed:", e?.message)
        }
        localStorage.removeItem("accessToken")
        setUser(null)
    }

    useEffect(()=>{
        api.get('/users/auth/me')
        .then(res=>setUser(res.data.data))
        .catch(()=>setUser(null))
        .finally(()=>setLoading(false))
    },[])

    return (
        <AuthContext.Provider value={{user,setUser,logout,loading}}>
            {children}
        </AuthContext.Provider>
    )
}
