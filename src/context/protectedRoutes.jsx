import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/Loader"
import { NotAuthenticated } from "../pages/404!Authenticated";
const baseUrl = import.meta.env.VITE_BASE_URL
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminType, setAdminType] = useState('');
    const [loading, setLoading] = useState(true);
    const [adminRestaurantId, setAdminRestaurantId] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get(`${baseUrl}/admin-actions/check-auth`,
                    { withCredentials: true }
                )
                setIsAuthenticated(true);
            } catch (error) {
                console.error('error:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false)
            }
        }
        checkAuth();
    }, [])

    useEffect(() => {
        const getAuthToken = () => {
            try {
                const token = Cookies.get('auth_token');
                if (!token) return
                const decoded = jwtDecode(token)
                setAdminType(decoded.adminType)
                if (decoded.adminType === 'shop-admin') setAdminRestaurantId(decoded.restaurantId)
            } catch (error) {
                console.log('error:', error);
            }
        }
        getAuthToken();
    }, [adminType])

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, adminType, adminRestaurantId }}>
            {children}
        </AuthContext.Provider>
    )
}

const ProtectedRoute = ({ roles }) => {
    const { isAuthenticated, loading, adminType } = useContext(AuthContext);
    if (loading) {
        return (<Loader />)
    }
    if (isAuthenticated && adminType !== '' && !roles.includes(adminType)) {
        return <NotAuthenticated />
    }
    return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

export { AuthProvider, ProtectedRoute, AuthContext }