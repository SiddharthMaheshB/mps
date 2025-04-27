import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';
import { cartItemSchema, updateCartItemSchema } from '../validation/shopValidation.js';

// @desc    Get all products
// @route   GET /api/shop/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// @desc    Get a product by ID
// @route   GET /api/shop/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get products by category
// @route   GET /api/shop/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.json(products);
});

// @desc    Get user's cart
// @route   GET /api/shop/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
        // If cart doesn't exist, create a new empty one
        const newCart = await Cart.create({
            user: req.user._id,
            items: [],
            totalAmount: 0
        });
        return res.json(newCart);
    }
    
    res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/shop/cart/items
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const validatedData = cartItemSchema.parse(req.body);
    const { productId, quantity, price, unit } = validatedData;
    
    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [],
            totalAmount: 0
        });
    }
    
    // Check if product is already in cart with same unit
    const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId && 
                (!unit || !item.selectedUnit || item.selectedUnit === unit)
    );
    
    if (existingItemIndex > -1) {
        // Update existing item
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            quantity,
            price: price || product.price,
            selectedUnit: unit || product.unit
        });
    }
    
    // Save the cart
    await cart.save();
    
    // Return the updated cart
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(201).json(updatedCart);
});

// @desc    Update cart item
// @route   PUT /api/shop/cart/items/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    const validatedData = updateCartItemSchema.parse(req.body);
    const { quantity } = validatedData;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }
    
    // Find the item to update
    const itemIndex = cart.items.findIndex(
        item => item._id.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found in cart');
    }
    
    // Update the quantity
    cart.items[itemIndex].quantity = quantity;
    
    // If quantity is 0, remove the item
    if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
    }
    
    // Save the cart
    await cart.save();
    
    // Return the updated cart
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
});

// @desc    Remove item from cart
// @route   DELETE /api/shop/cart/items/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }
    
    // Remove the item
    cart.items = cart.items.filter(
        item => item._id.toString() !== req.params.itemId
    );
    
    // Save the cart
    await cart.save();
    
    // Return the updated cart
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
});

export {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart
}; 