import { useState } from "react"
import BackVideo from "./BackVideo"
import Myfarm from "../frontimages/myfarm2.jpeg"
import vid1 from "../videos/1.mp4"
import Logo from "./Logo"
import Veggif from "../videos/veg.gif"
import "./styles.css"
const Login = ({login})=>{
    if(login){
        return(
            <>
            <p>404Not found!!</p>
            </>
        )
    }
    const [Username,setUsername] = useState("");
    const [Password,setPassword] = useState("");
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
    const handleSubmit = (eve)=>{
        eve.preventDefault();
        alert(`The username is: ${Username}`);
    
    } 

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
                    <div className="login-button-container">
                    <input type="submit" value ="Sign in" className="login-submit"/> 
                    <button type="button" class="login-with-google-btn" >
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