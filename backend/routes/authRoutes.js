import express from 'express';
import { 
    registerUser, 
    loginUser, 
    googleLogin, 
    googleCallback,
    getGoogleAuthURL,
    logoutUser, 
    getUserProfile,
    updateUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/google/url', getGoogleAuthURL);
router.get('/google/callback', googleCallback);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile/update', protect, updateUserProfile);

export default router; 