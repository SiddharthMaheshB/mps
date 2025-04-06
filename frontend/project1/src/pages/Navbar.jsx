import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useState, useEffect } from "react";
import axios from "axios";

function Navbar({ login, user, setLogin, setUser, ToFooter, ToFeatures }) {
  useEffect(() => {
    console.log("Navbar user:", user);
  }, [user]);

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = async () => {
    try {
      // Call logout API (optional, depends on your backend)
      const token = localStorage.getItem("token");
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        await axios.post("http://localhost:5000/api/auth/logout", {}, config);
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      
      // Update state
      setLogin(false);
      setUser(null);
      
      // Hide popup and redirect to home
      setShowLogoutPopup(false);
      navigate("/");
    }
  };

  const scrollTo= (ref)=>{
    if (ref && ref.current) {
      ref.current.scrollIntoView({behavior:"smooth"});
    }
  };

  if (login)
    return (
      <>
        <nav style={styles.navbar} className="main-navbar">
          <div style={styles.leftGroup}>
            <a href="/" aria-label="Home" style={{textDecoration:"none",color:"white"}}>
              <Logo style={styles.logo} />
            </a>
          </div>
          
          <div style={styles.rightGroup}>
            <Link to="/social" style={styles.navLink}>Social</Link>
            <Link to="/shop" style={styles.navLink}>Shop</Link>
            <Link to="/farmercorner" style={styles.navLink}>Farmer's Corner</Link>
            <Link to="/profile" style={styles.navLink}>Profile</Link>
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
      <div style={styles.leftGroup}>
        <a href="/" aria-label="Home" style={{textDecoration:"none",color:"white"}}>
          <Logo style={styles.logo} />
        </a>
      </div>
      <div style={styles.rightGroup}>
        <button onClick={() => scrollTo(ToFeatures)} style={styles.navLink}>About</button>
        <button onClick={() => scrollTo(ToFooter)} style={styles.navLink}>Contact</button>
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
    background: "#7A7A7A",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 20px",
    zIndex: 20,
    overflowX:"hidden",
    boxSizing: "border-box",
    marginBottom: 0,
    borderBottom: "none"
  },
  leftGroup: {
    display: "flex",
    alignItems: "center",
  },
  rightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "30px", // Even spacing between all items
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
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
    padding: "5px 15px",
    textDecoration:"none",
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
    color: "black",
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
