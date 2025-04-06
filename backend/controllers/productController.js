import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Farmers only)
const createProduct = asyncHandler(async (req, res) => {
    console.log("createProduct called with body:", req.body);
    console.log("User ID:", req.user._id);
    
    const { name, inventory, unit, price, description } = req.body;
    
    // Validate required fields
    if (!name || inventory === undefined || !unit || price === undefined) {
        console.log("Validation failed:", { name, inventory, unit, price });
        res.status(400);
        throw new Error('Please provide all required fields: name, inventory, unit, price');
    }
    
    try {
        // Create product with farmer ID
        const product = await Product.create({
            name,
            inventory: Number(inventory),
            unit,
            price: Number(price),
            description: description || '',
            farmer: req.user._id
        });
        
        console.log("Product created successfully:", product);
        
        if (product) {
            res.status(201).json(product);
        } else {
            res.status(400);
            throw new Error('Invalid product data');
        }
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(400);
        throw new Error(error.message || 'Invalid product data');
    }
});

// @desc    Get all products for the logged-in farmer
// @route   GET /api/products
// @access  Private (Farmers only)
const getFarmerProducts = asyncHandler(async (req, res) => {
    console.log("getFarmerProducts called for farmer ID:", req.user._id);
    
    try {
        const products = await Product.find({ farmer: req.user._id });
        console.log("Found products for farmer:", products.length);
        
        res.json(products);
    } catch (error) {
        console.error("Error fetching farmer products:", error);
        res.status(500);
        throw new Error("Failed to fetch products");
    }
});

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Private (Farmers only for their own products)
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    // Check if the product belongs to the logged-in farmer
    if (product.farmer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this product');
    }
    
    res.json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Farmers only for their own products)
const updateProduct = asyncHandler(async (req, res) => {
    const { name, inventory, unit, price, description } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    // Check if the product belongs to the logged-in farmer
    if (product.farmer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this product');
    }
    
    // Update product fields
    product.name = name || product.name;
    product.inventory = inventory !== undefined ? inventory : product.inventory;
    product.unit = unit || product.unit;
    product.price = price !== undefined ? price : product.price;
    product.description = description !== undefined ? description : product.description;
    
    const updatedProduct = await product.save();
    
    res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Farmers only for their own products)
const deleteProduct = asyncHandler(async (req, res) => {
    console.log("deleteProduct called for product ID:", req.params.id);
    console.log("User ID:", req.user._id);
    
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            console.log("Product not found");
            res.status(404);
            throw new Error('Product not found');
        }
        
        // Check if the product belongs to the logged-in farmer
        if (product.farmer.toString() !== req.user._id.toString()) {
            console.log("Not authorized: product.farmer =", product.farmer, "req.user._id =", req.user._id);
            res.status(403);
            throw new Error('Not authorized to delete this product');
        }
        
        await product.deleteOne();
        console.log("Product successfully deleted");
        
        res.json({ message: 'Product removed', success: true, productId: req.params.id });
    } catch (error) {
        console.error("Error deleting product:", error);
        if (error.name === 'CastError') {
            res.status(400);
            throw new Error('Invalid product ID format');
        }
        throw error;
    }
});

export {
    createProduct,
    getFarmerProducts,
    getProductById,
    updateProduct,
    deleteProduct
}; 