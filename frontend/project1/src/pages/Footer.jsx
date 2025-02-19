export default function Footer() {
    return (
      <footer style={footerStyle}>
        <p>&copy; {new Date().getFullYear()} AI-Powered Farming | All Rights Reserved</p>
        <p>Email: <a href="mailto:contact@AgriIntel.com" style={linkStyle}>contact@AgriIntel.com</a></p>
        <p>Contact: <a href="tel:1234567890" style={linkStyle}>123-456-7890</a></p>
      </footer>
    );
  }
  
  const footerStyle = {
    width: "100%",
    background: "black",
    color: "white",
    textAlign: "center",
    padding: "1rem 0",
    fontSize: "1rem",
    position: "relative",
    bottom: 0,
  };
  
  const linkStyle = {
    color: "lightgreen",
    textDecoration: "none",
    fontWeight: "bold",
  };
  