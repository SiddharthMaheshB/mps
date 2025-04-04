import { useState } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

const Cart = () => {

    
    const handleCheckout = () => {
        const newOrder = {
          id: Date.now(), // unique order ID
          items: cartItems,
          createdAt: new Date().toISOString()
        };
      
        
        console.log(newOrder);
        // Optionally clear cart
        setCartItems([]);
      
        // Redirect to order success page or display confirmation
        alert("Order placed successfully!");
        // navigate("/orders"); // if you have an orders page
      };
      
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Fresh Carrots",
      image: "/4.jpg",
      selectedPackages: [
        { size: "500g", price: 30, quantity: 2 },
        { size: "1kg", price: 55, quantity: 1 }
      ]
    },
    {
      id: 2,
      name: "Dairy Milk",
      image: "/5.jpg",
      selectedPackages: [
        { size: "250ml", price: 25, quantity: 3 },
        { size: "50ml", price: 5, quantity: 3 }
      ]
    }
  ]);

  const removePackage = (productId, sizeToRemove) => {
    setCartItems(prevCart =>
      prevCart
        .map(item => {
          if (item.id === productId) {
            const updatedPackages = item.selectedPackages.filter(pkg => pkg.size !== sizeToRemove);
            return { ...item, selectedPackages: updatedPackages };
          }
          return item;
        })
        .filter(item => item.selectedPackages.length > 0) // remove entire product if no packages left
    );
  };

  const updateQuantity = (productId, size, amount) => {
    setCartItems(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          const updatedPackages = item.selectedPackages.map(pkg =>
            pkg.size === size
              ? { ...pkg, quantity: Math.max(pkg.quantity + amount, 1) }
              : pkg
          );
          return { ...item, selectedPackages: updatedPackages };
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const productTotal = item.selectedPackages.reduce(
        (sum, pkg) => sum + pkg.price * pkg.quantity,
        0
      );
      return acc + productTotal;
    }, 0);
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
                <Link to={`/shop/product/${item.id}`} style={{ textDecoration: "none", color: "black" }}>
                  <h3>{item.name}</h3>
                </Link>

                {item.selectedPackages.map((pkg, index) => (
                  <div key={index} className="cart-package">
                    <div className="package-info">
                      <p>{pkg.size} - ₹{pkg.price} x {pkg.quantity} = ₹{pkg.price * pkg.quantity}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, pkg.size, -1)}>-</button>
                        <span>{pkg.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, pkg.size, 1)}>+</button>
                      </div>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removePackage(item.id, pkg.size)}>✖</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fixed Checkout Section */}
      <div className="cart-footer">
        <p className="cart-total">Total: ₹{calculateTotal()}</p>
        <button className="cart-checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
      </div>
      <br/>
      <br/>
    </div>
  );
};

export default Cart;
