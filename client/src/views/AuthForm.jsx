// src/views/AuthForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin, handleSignup } from "../models/authModel";
import '../css/AuthForm.css';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userName, setUserName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate();

    const clearForm = () => {
        setPassword("");
        setUserName("");
        setError("");
        setMessage("");  // Add this to clear success message
    };

    const toggleForm = () => {
        clearForm();  // Clear form when switching between login/signup
        setIsLogin(!isLogin);
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
        setLoading(true); // Set loading to true on submit
        
        try {
            if (isLogin) {
                const success = await handleLogin(email, password, navigate, setError, setLoading);
                if (!success || !verifyAuthData()) {
                    throw new Error('Login failed or missing auth data');
                }
            } else {
                const success = await handleSignup(userName, email, password, navigate, setMessage, setError);
                if (success) {
                    setPassword("");
                    setUserName("");
                    setIsLogin(true);
                    setMessage("Signup successful! Please login with your credentials.");
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err?.message || "Authentication failed");
        } finally {
            setLoading(false); // Reset loading state
        }
    };
    

    return ( 
        <div className="gradient-background">
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
                    <button onClick={() => setIsLogin(true)} className={isLogin ? "active" : ""}>Login</button>
                    <button onClick={() => setIsLogin(false)} className={!isLogin ? "active" : ""}>Signup</button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input type="text" placeholder="Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                    )}

                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

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

