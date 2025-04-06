import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    getFarmerProducts
} from '../controllers/productController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Product routes for farmers
router.route('/')
    .post(createProduct)
    .get(getFarmerProducts); // Get products for the logged-in farmer

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

export default router; 