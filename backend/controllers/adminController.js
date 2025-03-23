import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import { adminRegisterSchema, adminLoginSchema } from '../validation/adminValidation.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


const registerAdmin = asyncHandler(async (req, res) => {
    const validatedData = adminRegisterSchema.parse(req.body);
    const { username, email, password } = validatedData;

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
        res.status(400);
        throw new Error('Admin already exists');
    }

    const admin = await Admin.create({
        username,
        email,
        password
    });

    if (admin) {
        const token = generateToken(admin._id);
        
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            token
        });
    } else {
        res.status(400);
        throw new Error('Invalid admin data');
    }
});


const loginAdmin = asyncHandler(async (req, res) => {
    const validatedData = adminLoginSchema.parse(req.body);
    const { email, password } = validatedData;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
        const token = generateToken(admin._id);
        
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            token
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});


const logoutAdmin = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({ message: 'Admin logged out successfully' });
});


const getAdminDashboard = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
        res.json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role
        });
    } else {
        res.status(404);
        throw new Error('Admin not found');
    }
});

export { registerAdmin, loginAdmin, logoutAdmin, getAdminDashboard }; 