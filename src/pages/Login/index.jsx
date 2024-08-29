import Cookies from 'js-cookie';
import { IoFastFoodSharp } from "react-icons/io5";
import axios from "axios"
import React, { useContext, useEffect, useState } from "react";
import { useFoodApp } from "../../hooks/appProvider";
const baseUrl = import.meta.env.VITE_BASE_URL
import { AuthContext } from "../../context/protectedRoutes";

const Login = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { setErrorToast, setSuccessToast, navigate } = useFoodApp();
    const { isAuthenticated, adminType } = useContext(AuthContext);

    useEffect(() => {
        if (isAuthenticated) {
            adminType === 'admin' ? navigate('/') : navigate('/my-restaurant')
        }
    }, [isAuthenticated])

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${baseUrl}/admin-actions/login`, {
                username: userName,
                password,
                rememberMe
            })
            const options = {
                expires: rememberMe ? 30 : undefined,
                path: '/',
                sameSite: 'Lax',
                secure: false
            };
            const token = Cookies.get('auth_token');
            if (!token) {
                Cookies.set('auth_token', data.token, options);
            }
            setSuccessToast('Log in successful')
            sessionStorage.setItem('active', '/')
            window.location.href = data.admin.adminType === 'admin' ? '/' : '/my-restaurant'
        } catch (error) {
            console.log(error);
            if (error.response && error.response.data)
                setErrorToast(error.response.data.message || error.response.data.error)
            else
                setErrorToast('Something Went Wrong')
            console.error(error);
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="food-app-logo">
                    <svg width="0" height="0">
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#d444eb', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#73257f', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <IoFastFoodSharp className="gradient-icon" style={{
                        fontSize: '3em',
                        fill: 'url(#gradient1)'
                    }} />
                    <h1>FOOD APP</h1>
                </div>
                <div className="signin-inputs">
                    <h1>Sign In</h1>
                    <input
                        placeholder="username"
                        className="username"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => {
                            (e.key === 'Enter' && handleLogin(e))
                        }}
                    />
                    <input
                        placeholder="password"
                        className="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            (e.key === 'Enter' && handleLogin(e))
                        }}
                    />
                    <div className="rememberme-forget-pass">
                        <div className="rememberme-checkbox">
                            <input
                                type="checkbox"
                                name=""
                                id="remember-me"
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <p onClick={() => {
                                document.getElementById('remember-me').checked = !rememberMe
                                setRememberMe(!rememberMe)
                            }}>Remember Me</p>
                        </div>
                        <div className="forget-pass-link">
                            <a href="#">Forget Password?</a>
                        </div>
                    </div>
                </div>
                <div className="login-button">
                    <button onClick={handleLogin}>LOG IN</button>
                </div>
            </div>
        </div>
    )
}

export default Login;