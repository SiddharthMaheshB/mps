import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

// Get current file path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'profiles'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// ... existing routes ...

// Profile image upload route
router.post('/update-profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Get the file path
    const profileImage = `/uploads/profiles/${req.file.filename}`;

    // Update user profile in database with new image
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      profileImage
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile image'
    });
  }
});

export default router; 