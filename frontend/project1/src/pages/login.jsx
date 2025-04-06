import { useState } from "react"
import { useNavigate } from "react-router-dom"
import BackVideo from "./BackVideo"
import Myfarm from "../frontimages/myfarm2.jpeg"
import vid1 from "../videos/1.mp4"
import Logo from "./Logo"
import Veggif from "../videos/veg.gif"
import "./styles.css"
import axios from "axios"

const Login = ({login, setLogin, setUser}) => {
    const navigate = useNavigate();
    
    if(login){
        return(
            <>
            <p>404Not found!!</p>
            </>
        )
    }
    
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const { email, password } = formData;
    
     const myStyle = {
          padding:0,
          top:0,
          left:0,
          backgroundImage : `url(${Myfarm})`,
          height: "100vh",
          width: "100%",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          boxSizing: "border-box",
        }
        
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
        
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            
            const { token, username, _id, mobile } = response.data;
            
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
            setError(
                error.response?.data?.message || 
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    }

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
        <div style={myStyle}>
            <div className="logo-container">
                <a  href="/" aria-label="Home">
                <Logo/>
                </a>
            </div>
           
                <div className="login-content" > 
                <img src={Veggif} alt="sign in" className="sign-ingif"/>
                <form onSubmit={handleSubmit}>
                    
                    <label>Email:
                        <input 
                            type="email" 
                            name="email"
                            value={email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <br/>
                    <div id="password">
                    <label>Password:
                        <input 
                            type="password"
                            name="password" 
                            value={password}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <a href="/">Forgot password?</a>
                    </div>
                    <br/>
                    {error && <div className="error-message">{error}</div>}
                    <div className="login-button-container">
                    <input 
                        type="submit" 
                        value={loading ? "Signing in..." : "Sign in"} 
                        className="login-submit"
                        disabled={loading}
                    /> 
                    <button 
                        type="button" 
                        className="login-with-google-btn"
                        onClick={handleGoogleLogin}
                    >
                        Sign in with Google
                    </button>
                    </div>
                </form>  
                <div>
                    <p>don't have an account?<a href="/register">Sign up</a></p>
                    
                </div>
                </div>
            

            
        </div>
    )
}

export default Login