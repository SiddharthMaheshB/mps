import { Link, useLocation } from 'react-router-dom';

export default function EcommerceLayout({ children }) {
  const location = useLocation();
  const cartCount = 0; // Replace with actual cart count

  return (
    <div className="ecommerce-container">
      <header className="ecom-header">
        <div className="header-content">
          <div className="shop-nav">
            <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link>
            <Link to="/shop/cart" className={location.pathname === '/shop/cart' ? 'active' : ''}>Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</Link>
            <Link to="/shop/order-history" className={location.pathname === '/shop/order-history' ? 'active' : ''}>Orders</Link>
          </div>
        </div>
      </header>
    </div>
  );
} 