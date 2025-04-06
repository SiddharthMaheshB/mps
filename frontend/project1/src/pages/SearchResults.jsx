import { useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
const products = [
    
      { id: 1, name: 'Fresh Carrots', price: 3, image: '/4.jpg', unit: 'kg', isLiquid: false },
      { id: 2, name: 'Tomatoes', price: 4, image: '/3.jpg', unit: 'kg', isLiquid: false },
   
    
      { id: 3, name: 'Organic Apples', price: 5, image: '/3.jpg', unit: 'kg', isLiquid: false },
      { id: 4, name: 'Bananas', price: 2, image: '/5.jpg', unit: 'kg', isLiquid: false },
    
   
      { id: 5, name: 'Dairy Milk', price: 7, image: '/5.jpg', unit: 'Litre', isLiquid: true },
      { id: 6, name: 'Cheese', price: 10, image: '/4.jpg', unit: 'kg', isLiquid: false },
    ]

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query")?.toLowerCase() || ""; // Get search query
    console.log(query);

    // Filter products based on search query
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(query)
    );

    return (
        <div className="search-results-container">
            <h2>Search Results for "{query}"</h2>
            {filteredProducts.length > 0 ? (
                <div className="products-grid">
                    {filteredProducts.map((product) => (
                       <ProductCard key={product.id} product={product}/> 
                    ))}
                </div>
            ) : (
                <p>No products found.</p>
            )}
        </div>
    );
}
