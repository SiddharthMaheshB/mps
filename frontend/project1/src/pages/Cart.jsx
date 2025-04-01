import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
    const navigate = useNavigate();

    // Hardcoded cart data (simulating server response)
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Fresh Carrots", price: 3, quantity: 1, image: "/4.jpg" },
        { id: 2, name: "Tomatoes", price: 4, quantity: 2, image: "/5.jpg" }
    ]);

    // Remove item from cart (just updating state for now)
    const removeFromCart = (id) => {
        setCartItems((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    return (
        <div className="cart-page">
            <h2 className="cart-title">Your Cart</h2>

            {cartItems.length === 0 ? (
                <p className="cart-empty">Your cart is empty.</p>
            ) : (
                <div className="cart-items-container">
                    {cartItems.map((item) => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image} alt={item.name} className="cart-item-image" />
                            <div className="cart-item-details">
                            <Link to={`/shop/${item.id}`}  style={{textDecoration:"none",color:"black"}}><h3>{item.name}</h3></Link>
                                <p>₹{item.price} x {item.quantity} kg</p>
                            </div>
                            <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>✖</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Fixed Checkout Section */}
            <div className="cart-footer">
                <p className="cart-total">
                    Total: ₹{cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                </p>
                <button className="cart-checkout-btn">Proceed to Checkout</button>
            </div>
        </div>
    );
};

export default Cart;
