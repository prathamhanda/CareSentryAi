import { createContext, useContext, useEffect, useState } from "react"
import api from "../api/axios.js"

const AuthContext=createContext()

export function AuthProvider({children}){
    const [user,setUser]=useState(null)
    const [loading,setLoading]=useState(true)

    const logout=async()=>{
        try{
            await api.post('/users/logout')
            setUser(null)
        }catch(_e){
            setUser(null)
        }
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

export const useAuth=()=>useContext(AuthContext)