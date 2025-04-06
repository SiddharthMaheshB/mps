import mongoose from 'mongoose';
import dotenv from 'dotenv';
import products from './data/products.js';
import Product from './models/productModel.js';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        // Clear existing data
        await Product.deleteMany();

        // Create admin user
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        
        let adminId;
        
        if (adminUser) {
            adminId = adminUser._id;
        } else {
            const createdAdmin = await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: 'password123',
                mobile: '1234567890'
            });
            adminId = createdAdmin._id;
        }

        // Add admin as seller to all products
        const sampleProducts = products.map(product => {
            return { ...product, seller: adminId };
        });

        // Insert products
        await Product.insertMany(sampleProducts);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        // Delete all data
        await Product.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Run based on command line argument
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
} 