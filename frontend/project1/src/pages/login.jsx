import { useState } from "react"
import BackVideo from "./BackVideo"
import vid1 from "../videos/1.mp4"
const Login = ()=>{
    const [Username,setUsername] = useState("");
    const [Password,setPassword] = useState("");
    const handleSubmit = (eve)=>{
        eve.preventDefault();
        alert(`The username is: ${Username}`);
        
    }
    return (
        <div>
            <BackVideo imgUrl={vid1} child={(
                <>
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    
                    <label>Username:
                        <input type="text"
                        value={Username}
                        onChange={(e)=>setUsername(e.target.value)}/>
                    </label>
                    <br/>
                    <label>Password:
                        <input type="password"
                        value={Password}
                        onChange={(e)=>setPassword(e.target.value)}/>
                    </label>
                    <br/>
                    <input type="submit" value ="Log in" id="submit"/>
                </form>  
                </>
            )}/>
            
        </div>
    )
}

export default Login