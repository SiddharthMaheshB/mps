import { useState } from "react";
import BackVideo from "./BackVideo";
import Onlyplant from "../frontimages/rural.png"
import vid1 from "../videos/giphy.gif";
import Logo from "./Logo";
import "./styles.css";

const Register = ({login}) => {
    if(login){
        return(
            <>
            <p>404 Not Found !!</p>
            </>
        )
    }
    const [username, setUsername] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
    const handleSubmit = (eve) => {
        eve.preventDefault();
        alert(`Registered with Username: ${username}, Mobile: ${mobile}, Email: ${email}`);
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
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </label>
                        <br />
                        <label>Mobile Number:
                            <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                        </label>
                        <br />
                        <label>Email:
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </label>
                        <br />
                        <label>Create Password:
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </label>
                        <br />
                        <div className="login-button-container">
                            <input type="submit" value="Register" className="login-submit" style={{padding:"30px",paddingTop:"20px",paddingLeft:"20px",paddingBottom:"20px"}} />
                            <button type="button" className="login-with-google-btn">
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