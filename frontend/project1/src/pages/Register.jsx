import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackVideo from "./BackVideo";
import Onlyplant from "../frontimages/rural.png"
import vid1 from "../videos/giphy.gif";
import Logo from "./Logo";
import "./styles.css";
import axios from "axios";

const Register = ({login, setLogin, setUser}) => {
    const navigate = useNavigate();
    
    if(login){
        return(
            <>
            <p>404 Not Found !!</p>
            </>
        )
    }
    
    const [formData, setFormData] = useState({
        username: "",
        mobile: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const { username, mobile, email, password } = formData;
    
    const myStyle = {
        position:"fixed",
        padding:0,
        top:0,
        left:0,
        backgroundImage : `url(${Onlyplant})`,
        height: "100vh",
        width: "100%",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        boxSizing: "border-box",
        zIndex: -1,
    }
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password,
                mobile
            });
            
            const { token, _id } = response.data;
            
            // Store token in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', _id);
            
            // Create user object
            const userObj = {
                name: username,
                username: username,
                email: email,
                mobile: mobile,
                _id: _id,
                role: "Farmer", // Default role
                avatar: "/1.png" // Default avatar
            };
            
            // Store user object in localStorage
            localStorage.setItem('user', JSON.stringify(userObj));
            
            // Update app state
            setLogin(true);
            setUser(userObj);
            
            // Redirect to home page
            navigate('/');
            
        } catch (error) {
            if (error.response?.data?.errors) {
                // Handle Zod validation errors
                const validationErrors = error.response.data.errors;
                setError(validationErrors.map(err => err.message).join(", "));
            } else {
                setError(
                    error.response?.data?.message || 
                    "Registration failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError("");
            
            // Request Google OAuth URL from backend
            const response = await axios.get("http://localhost:5000/api/auth/google/url");
            
            if (response.data && response.data.authUrl) {
                console.log("Google OAuth data:", response.data);
                
                // Use direct URL to avoid manipulation issues
                const authUrl = response.data.authUrl;
                
                // Log the URL for debugging
                console.log("Google Auth URL:", authUrl);
                
                // Redirect to Google login
                window.location.href = authUrl;
            } else {
                setError("Failed to get Google authentication URL");
            }
        } catch (error) {
            console.error("Google login error:", error);
            setError("Failed to initiate Google login. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={myStyle} >
            <div className="logo-container">
                <a href="/" aria-label="Home">
                    <Logo />
                </a>
            </div>
            
            <div className="login-content" style={{paddingTop:"10vh"}}>
                <img src={vid1} alt="sign in" className="sign-ingif"/>
                <form onSubmit={handleSubmit}>
                    <label>Username:
                        <input 
                            type="text" 
                            name="username" 
                            value={username} 
                            onChange={handleChange}
                            required 
                        />
                    </label>
                    <br />
                    <label>Mobile Number:
                        <input 
                            type="text" 
                            name="mobile" 
                            value={mobile} 
                            onChange={handleChange} 
                        />
                    </label>
                    <br />
                    <label>Email:
                        <input 
                            type="email" 
                            name="email" 
                            value={email} 
                            onChange={handleChange}
                            required 
                        />
                    </label>
                    <br />
                    <label>Create Password:
                        <input 
                            type="password" 
                            name="password" 
                            value={password} 
                            onChange={handleChange}
                            required 
                        />
                    </label>
                    <br />
                    {error && <div className="error-message">{error}</div>}
                    <div className="login-button-container">
                        <input 
                            type="submit" 
                            value={loading ? "Registering..." : "Register"} 
                            className="login-submit" 
                            style={{padding:"30px",paddingTop:"20px",paddingLeft:"20px",paddingBottom:"20px"}}
                            disabled={loading} 
                        />
                        <button 
                            type="button" 
                            className="login-with-google-btn"
                            onClick={handleGoogleLogin}
                        >
                            Sign up with Google
                        </button>
                    </div>
                </form>
                <div>
                    <p>Already have an account? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    );
};

export default Register;