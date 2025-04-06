import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getAllProducts, 
    getProductById, 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeFromCart,
    getProductsByCategory
} from '../controllers/shopController.js';

const router = express.Router();

// Public routes
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.get('/products/category/:category', getProductsByCategory);

// Protected routes
router.use(protect);

// Cart routes
router.route('/cart')
    .get(getCart);

router.route('/cart/items')
    .post(addToCart);

router.route('/cart/items/:itemId')
    .put(updateCartItem)
    .delete(removeFromCart);

export default router; 