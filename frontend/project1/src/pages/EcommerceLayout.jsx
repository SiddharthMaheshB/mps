import { Link, Outlet } from "react-router-dom";
import { FaHome, FaShoppingCart } from "react-icons/fa"; // Importing white icons
import "./ecommerce.css"; // Import CSS for styling

export default function EcommerceLayout({login}) {
    if(!login){
        return (<>404 Not FOund!!</>);
    }
    return (
        <div className="ecommerce-container">
            {/* Top Bar */}
            <div>
            <nav className="top-bar">
                <h1 className="ecom-logo">FarmStore</h1> {/* Left Side - Logo or Title */}
                <input type="text" placeholder="Search farm products..." className="search-bar" />
                <div className="ecom-icons">
                    <Link to="/shop">
                        <FaHome className="icon" />
                    </Link>
                    <Link to="/shop/cart">
                        <FaShoppingCart className="icon" />
                    </Link>
                </div>
            </nav>
            </div>
            {/* Page Content */}
            <div className="ecom-content">
                <Outlet />
            </div>
        </div>
    );
}
