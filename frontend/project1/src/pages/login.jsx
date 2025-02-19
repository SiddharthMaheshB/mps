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
                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>
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
                    <input type="submit"/>
                </form>  
            )}/>
            
        </div>
    )
}

export default Login