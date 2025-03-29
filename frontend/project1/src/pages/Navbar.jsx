import { Link } from "react-router-dom";
import Logo from "./Logo";
import { useState } from "react";

function Navbar({ login, ToFooter, ToFeatures }) {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = () => {
    setShowLogoutPopup(false);
    console.log("User logged out!"); // Replace with actual logout logic
  };

  if (login)
    return (
      <>
        <nav style={styles.navbar}>
        <a  href="/" aria-label="Home"  style={{textDecoration:"none",color:"white"}}>
        <Logo style={styles.logo} />
          </a>
          
          <div>
            <Link to="/social" style={styles.link}>Social</Link>
            <Link to="/shop" style={styles.link}>Shop</Link>
            <Link to="/farmercorner" style={styles.link}>Farmer's Corner</Link>
            <Link to="/profile" style={styles.link}>Profile</Link>
            <button style={styles.button} onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Logout Confirmation Popup */}
        {showLogoutPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.popup}>
              <p>Are you sure you want to logout?</p>
              <button style={styles.popupButton} onClick={confirmLogout}>Yes</button>
              <button style={styles.popupButton} onClick={() => setShowLogoutPopup(false)}>No</button>
            </div>
          </div>
        )}
      </>
    );

  return (
    <nav style={styles.navbar}>
      <Logo style={styles.logo} />
      <div>
        <button onClick={() => scrollTo(ToFeatures)} style={styles.link}>About</button>
        <button onClick={() => scrollTo(ToFooter)} style={styles.link}>Contact</button>
        <Link style={styles.button} to="/login">Login</Link>
        <Link style={styles.button} to="/register">Register</Link>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    background: "rgba(0, 0, 0, 0.5)",
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
    border: 0,
    cursor: "pointer",
  },
  button: {
    background: "transparent",
    border: "1px solid white",
    borderRadius: "5px",
    color: "white",
    fontSize: "18px",
    margin: "0 10px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  popup: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
  popupButton: {
    margin: "10px",
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    background: "#007bff",
    color: "white",
  },
};

export default Navbar;
