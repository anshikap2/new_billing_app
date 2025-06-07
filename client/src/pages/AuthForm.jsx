// src/views/AuthForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin, handleSignup } from "../models/authModel";
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import '../css/AuthForm.css';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userName, setUserName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const clearForm = () => {
        setPassword("");
        setUserName("");
        setEmail("");
        setError("");
        setMessage("");
        setShowPassword(false);
    };

    const toggleForm = () => {
        clearForm();  // Clear form first
        toast.dismiss(); // Clear any existing toasts
        setTimeout(() => {
            setIsLogin(!isLogin); // Toggle form state after clearing
        }, 0);
    };

    const verifyAuthData = () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');
        console.log('Verifying auth data:', { userId, hasToken: !!token });
        return userId && token;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        
        try {
            if (isLogin) {
                const success = await handleLogin(email, password, navigate, setError, setLoading);
                if (!success || !verifyAuthData()) {
                    throw new Error('Login failed or missing auth data');
                }
                toast.success('🎉 Successfully logged in!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "colored"
                });
            } else {
                const success = await handleSignup(userName, email, password, navigate, setMessage, setError);
                if (success) {
                    clearForm(); // Clear form after successful signup
                    setIsLogin(true);
                    toast.success('✨ Account created successfully! Please login.', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        theme: "colored"
                    });
                }
            }
        } catch (err) {
            toast.error(err?.message || "Authentication failed", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored"
            });
            setError(err?.message || "Authentication failed");
        } finally {
            setLoading(false); // Reset loading state
        }
    };
    

    return ( 
        <div className="gradient-background">
            <ToastContainer />
             <button
            className="auth-btn-back"
            type="button"
            onClick={() => navigate("/home")}
          >
            Back
          </button>
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">{isLogin ? "Login" : "Signup"} Form</h2>

                <div className="auth-toggle">
                    <button onClick={toggleForm} className={isLogin ? "active" : ""}>Login</button>
                    <button onClick={toggleForm} className={!isLogin ? "active" : ""}>Signup</button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input type="text" placeholder="Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                    )}

                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    
                    <div className="password-input-container" style={{ position: 'relative', width: '100%' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '5px',
                                color: '#666'
                            }}
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}

                    <button 
                        className="auth-button" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : isLogin ? "Login" : "Signup"}
                    </button>
                </form>

                <p className="auth-footer">
                    {isLogin ? "Not a member?" : "Already have an account?"}{" "}
                    <span onClick={toggleForm} className="auth-toggle-link">
                        {isLogin ? "Signup now" : "Login here"}
                    </span>
                </p>
            </div>
        </div>
        </div>
    );
};

export default AuthForm;

