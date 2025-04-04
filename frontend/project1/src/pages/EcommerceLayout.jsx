import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaHome, FaShoppingCart } from "react-icons/fa"; // Importing white icons
import "./ecommerce.css"; // Import CSS for styling
import { useState } from "react";

export default function EcommerceLayout({login}) {
    if(!login){
        return (<>404 Not FOund!!</>);
    }
    const [query,setQuery]= useState("");
    const navi = useNavigate();
    const handleSearch = (e)=>{
        e.preventDefault();
        if(query.trim()){
            navi(`/shop/search?query=${query}`);
        }
    }
    return (
        <div className="ecommerce-container">
            {/* Top Bar */}
            <div>
            <nav className="top-bar">
                <h1 className="ecom-logo">FarmStore</h1> {/* Left Side - Logo or Title */}
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search farm products..."
                        className="search-bar"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="search-button">Search</button>
                </form>
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
