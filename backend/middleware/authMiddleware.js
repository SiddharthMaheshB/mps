import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
    console.log("Auth middleware called");
    
    // Get token from request
    let token = req.cookies?.jwt;
    console.log("Token from cookies:", token ? "Present" : "None");

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("Token from Authorization header:", token ? "Present" : "None");
    }

    if (!token) {
        console.log("No token found in request");
        res.status(401);
        throw new Error('Not authorized, please log in');
    }

    try {
        console.log("Verifying token...");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            console.log("Token expired at:", new Date(decoded.exp * 1000).toISOString());
            console.log("Current time:", new Date(currentTime * 1000).toISOString());
            res.status(401);
            throw new Error('Session expired, please log in again');
        }
        
        console.log("Token verified, user ID:", decoded.id);
        
        // Find user by ID
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            console.log("User not found in database");
            res.status(401);
            throw new Error('User not found, please log in again');
        }
        
        console.log("User authenticated:", user.username);
        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        
        // Return specific error message based on the JWT error
        if (error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Session expired, please log in again');
        } else if (error.name === 'JsonWebTokenError') {
            res.status(401);
            throw new Error('Invalid token, please log in again');
        } else {
            res.status(401);
            throw new Error('Not authorized, please log in again');
        }
    }
});

export { protect }; 