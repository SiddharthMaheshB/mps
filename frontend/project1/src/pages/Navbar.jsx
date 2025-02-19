import { Link } from "react-router-dom";
import Logo from "./Logo"
import { useState,useRef } from "react";
function Navbar({ login, scrollToFooter, scrollToFeatures  }) {
  if(login)
    return (
      <nav style={styles.navbar}>
       <Logo style={styles.logo}/>
        <div>
          <Link to="/profile" style={styles.link}>Profile</Link>
          <Link to="/Social" style={styles.link}>Social</Link>
          <Link to="/contact" style={styles.link}>Contact</Link>
          <button style={styles.button}>Logout</button> 
        </div>
      </nav>
    )
    
  return (
    <nav style={styles.navbar}>
      <Logo  style={styles.logo}/>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <button onClick={scrollToFeatures} style={styles.link}>About</button>
        <button onClick={scrollToFooter} style={styles.link}>Contact</button>

      <Link style={styles.button} to="/login">Login</Link>
      <Link style={styles.button} to="/register">Register</Link>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: "absolute",  // Overlays on top
    top: 0,
    left: 0,
    width: "100%",
    background: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 10px",
    zIndex: 10,
    overflowX:"hidden",
    boxSizing: "border-box",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  link: {
    color: "white",
    textDecoration: "none",
    margin: "0 10px",
    fontSize: "18px",
    background: "transparent",
    border:0,
    cursor: "pointer",
  },
  button: {
    background: "transparent",
    border: "1px solid white",
    textDecoration: "none",
    borderRadius:"5px",
    color: "white",
    fontSize: "18px",
    margin: "0 10px",
    padding: "5px 5px",
    cursor: "pointer",
  },
};



export default Navbar;
