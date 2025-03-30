import { Link, Outlet } from "react-router-dom";
import { FaHome, FaShoppingCart } from "react-icons/fa"; // Importing white icons
import "./ecommerce.css"; // Import CSS for styling

export default function EcommerceLayout() {
    return (
        <div className="ecommerce-container">
            {/* Top Bar */}
            <div>
            <nav className="top-bar">
                <h1 className="logo">FarmStore</h1> {/* Left Side - Logo or Title */}
                <input type="text" placeholder="Search farm products..." className="search-bar" />
                <div className="icons">
                    <Link to="/ecommerce">
                        <FaHome className="icon" />
                    </Link>
                    <Link to="/ecommerce/cart">
                        <FaShoppingCart className="icon" />
                    </Link>
                </div>
            </nav>
            </div>
            {/* Page Content */}
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
}
