import React from 'react';
import { useParams, Link } from 'react-router-dom';

const products = [
  { id: 1, name: 'Organic Apples', price: 5, image: '/images/apple.jpg', description: 'Fresh organic apples from local farms.' },
  { id: 2, name: 'Fresh Carrots', price: 3, image: '/images/carrot.jpg', description: 'Crisp and fresh carrots directly from the farm.' },
  { id: 3, name: 'Dairy Milk', price: 7, image: '/images/milk.jpg', description: 'Pure and fresh dairy milk.' },
];

export default function ProductDetail() {
  const { productId } = useParams();
  const product = products.find((p) => p.id === parseInt(productId));

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <div className="product-detail">
      <img src={product.image} alt={product.name} className="product-image-large" />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ₹{product.price} per kg</p>
      <button>Add to Cart</button>
      <Link to="/shop">Back to Shop</Link>
    </div>
  );
}
