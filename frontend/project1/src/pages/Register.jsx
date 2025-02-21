import { useState } from "react";
import BackVideo from "./BackVideo";
import vid1 from "../videos/3.mp4";
import Logo from "./Logo";
import "./styles.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (eve) => {
        eve.preventDefault();
        alert(`Registered with Username: ${username}, Mobile: ${mobile}, Email: ${email}`);
    };

    return (
        <div>
            <div className="logo-container">
                <a href="/" aria-label="Home">
                    <Logo />
                </a>
            </div>
            <BackVideo imgUrl={vid1} child={(
                <>
                    <h1>Register</h1>
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
                        <div className="button-container">
                            <input type="submit" value="Register" id="submit" />
                            <button type="button" className="login-with-google-btn">
                                Sign up with Google
                            </button>
                        </div>
                    </form>
                    <div>
                        <p>Already have an account? <a href="/login">Login</a></p>
                    </div>
                </>
            )} />
        </div>
    );
};

export default Register;