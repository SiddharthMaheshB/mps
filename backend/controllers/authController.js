import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = asyncHandler(async (req, res) => {
    const validatedData = registerSchema.parse(req.body);

    const { username, email, password, mobile } = validatedData;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        username,
        email,
        password,
        mobile
    });

    if (user) {
        // Create token
        const token = generateToken(user._id);
        
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            token
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


const loginUser = asyncHandler(async (req, res) => {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Create token
        const token = generateToken(user._id);
        
        // Set JWT as HTTP-Only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            token
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    // Clear the JWT cookie
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { registerUser, loginUser, logoutUser, getUserProfile }; 