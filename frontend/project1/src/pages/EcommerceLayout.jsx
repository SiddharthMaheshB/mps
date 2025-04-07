import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaShoppingCart, FaHistory } from "react-icons/fa"; // Added FaHistory
import "./ecommerce.css"; // Import CSS for styling
import { useShop } from '../context/ShopContext';

const EcommerceLayout = ({ login }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [query, setQuery] = useState("");
    const [cartItemCount, setCartItemCount] = useState(0);

    // Clear cart data and reset count - call this when cart is corrupted
    const resetCartData = () => {
        console.log('Completely resetting cart data');
        localStorage.removeItem('localCart');
        localStorage.setItem('localCart', '[]');
        setCartItemCount(0);
    };

    useEffect(() => {
        const checkLogin = () => {
            const token = localStorage.getItem('token');
            if (!token && !login) {
                navigate('/');
            }
        };
        
        checkLogin();
        
        // Initial check and cleanup - ensure cart data is valid
        try {
            const localCartStr = localStorage.getItem('localCart');
            if (!localCartStr || localCartStr === 'undefined' || localCartStr === 'null') {
                console.log('Cart data was missing or invalid, resetting...');
                resetCartData();
                return;
            }
            
            const localCart = JSON.parse(localCartStr);
            if (!Array.isArray(localCart)) {
                console.log('Cart data was not an array, resetting...');
                resetCartData();
                return;
            }
            
            // Remove any invalid items from the cart
            const validCart = localCart.filter(item => 
                item && typeof item === 'object' && 'quantity' in item && Number(item.quantity) > 0
            );
            
            if (validCart.length !== localCart.length) {
                console.log('Found invalid items in cart, cleaning up...');
                localStorage.setItem('localCart', JSON.stringify(validCart));
            }
            
            if (validCart.length === 0) {
                console.log('Cart is empty after validation, ensuring count is 0');
                setCartItemCount(0);
            }
        } catch (error) {
            console.error('Error parsing cart data, resetting cart:', error);
            resetCartData();
        }
        
        // Load cart count from localStorage
        const updateCartCount = () => {
            try {
                const localCartStr = localStorage.getItem('localCart');
                if (!localCartStr || localCartStr === '[]') {
                    console.log('Cart is explicitly empty, forcing count to 0');
                    setCartItemCount(0);
                    return;
                }
                
                const localCart = JSON.parse(localCartStr);
                
                // Only set cart count if there are items in the cart
                if (localCart && Array.isArray(localCart) && localCart.length > 0) {
                    const itemCount = localCart.reduce((total, item) => {
                        const qty = Number(item?.quantity || 0);
                        return total + (qty > 0 ? qty : 0);
                    }, 0);
                    
                    console.log('Cart count calculated:', itemCount);
                    setCartItemCount(itemCount > 0 ? itemCount : 0);
                } else {
                    console.log('Cart is empty or invalid, setting count to 0');
                    setCartItemCount(0);
                }
            } catch (error) {
                console.error('Error loading cart count:', error);
                // Reset cart count on error
                setCartItemCount(0);
            }
        };
        
        // Initialize and set up event listener
        updateCartCount();
        
        // Define a custom event handler
        const handleCartUpdate = () => {
            console.log('Cart updated event detected');
            updateCartCount();
        };
        
        // Listen for storage events to update cart count
        window.addEventListener('storage', updateCartCount);
        // Listen for custom event when cart is updated
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        // Fire cart updated event to force refresh
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Set interval to periodically check cart count for consistency
        const intervalId = setInterval(() => {
            updateCartCount();
        }, 5000);
        
        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', handleCartUpdate);
            clearInterval(intervalId);
        };
    }, [login, navigate]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/shop/search?query=${query}`);
        }
    }

    if (!login) {
        return (<>404 Not Found!!</>);
    }

    return (
        <div className="ecommerce-container">
            {/* Shop Bar - Secondary navigation specific to shop section */}
            <div className="shop-nav-wrapper">
                <nav className="top-bar shop-nav">
                    <div className="ecom-logo">
                        <div className="shop-title">Farm Storage</div>
                    </div>
                    <div className="search-container">
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
                    </div>
                <div className="ecom-icons">
                        <Link to="/shop" className={`nav-icon ${location.pathname === '/shop' || location.pathname.startsWith('/shop/product') ? 'active' : ''}`}>
                        <FaHome className="icon" />
                    </Link>
                        <Link to="/shop/order-history" className={`nav-icon ${location.pathname === '/shop/order-history' ? 'active' : ''}`}>
                            <FaHistory className="icon" />
                        </Link>
                        <Link to="/shop/cart" className={`nav-icon ${location.pathname === '/shop/cart' ? 'active' : ''}`}>
                        <FaShoppingCart className="icon" />
                            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                    </Link>
                </div>
            </nav>
            </div>
            {/* Page Content */}
            <div className="ecom-content">
                <Outlet />
            </div>
            <div className="ecom-footer" style={{textAlign:"center",alignItems:"center"}}>
                <p>© 2023 Farm Shop. All rights reserved.</p>
            </div>
        </div>
    );
}

export default EcommerceLayout;

