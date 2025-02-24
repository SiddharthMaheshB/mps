import { useState } from "react"
import BackVideo from "./BackVideo"
import vid1 from "../videos/2.mp4"
import Logo from "./Logo"
import "./styles.css"
const Login = ()=>{
    const [Username,setUsername] = useState("");
    const [Password,setPassword] = useState("");
    const handleSubmit = (eve)=>{
        eve.preventDefault();
        alert(`The username is: ${Username}`);
    
    } 

    return (
        <div>
            <div className="logo-container">
                <a  href="/" aria-label="Home">
                <Logo/>
                </a>
            </div>
            <BackVideo imgUrl={vid1} child={(
                <> 
                <h1 >Sign In</h1>
                <form onSubmit={handleSubmit}>
                    
                    <label>Username:
                        <input type="text"
                        value={Username}
                        onChange={(e)=>setUsername(e.target.value)}/>
                    </label>
                    <br/>
                    <div id="password">
                    <label>Password:
                        <input type="password"
                        value={Password}
                        onChange={(e)=>setPassword(e.target.value)}/>
                    </label>
                    <a href="/">Forgot password?</a>
                    </div>
                    <br/>
                    <div className="button-container">
                    <input type="submit" value ="Sign in" id="submit"/> 
                    <button type="button" class="login-with-google-btn" >
                        Sign in with Google
                    </button>
                    </div>
                </form>  
                <div>
                    <p>don't have an account?<a href="/register">Sign up</a></p>
                    
                </div>
                </>
            )}/>

            
        </div>
    )
}

export default Login