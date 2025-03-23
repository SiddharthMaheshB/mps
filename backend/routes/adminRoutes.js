import express from 'express';
import { registerAdmin, loginAdmin, logoutAdmin, getAdminDashboard } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.post('/register', protectAdmin, registerAdmin); // Only existing admins can create new admins
router.post('/logout', protectAdmin, logoutAdmin);
router.get('/dashboard', protectAdmin, getAdminDashboard);

export default router; 