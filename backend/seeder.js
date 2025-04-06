import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import connectDB from './config/db.js';

dotenv.config();

// Sample product data
const products = [
    {
        name: 'Fresh Carrots',
        price: 40,
        image: '4.jpg',
        category: 'vegetables',
        description: 'Fresh, organic carrots sourced directly from local farmers.',
        inventory: 100,
        unit: 'kg',
        isLiquid: false
    },
    {
        name: 'Tomatoes',
        price: 30,
        image: '3.jpg',
        category: 'vegetables',
        description: 'Ripe, juicy tomatoes perfect for salads and cooking.',
        inventory: 80,
        unit: 'kg',
        isLiquid: false
    },
    {
        name: 'Organic Apples',
        price: 260,
        image: '3.jpg',
        category: 'fruits',
        description: 'Premium organic apples with a crisp, sweet taste.',
        inventory: 50,
        unit: 'kg',
        isLiquid: false
    },
    {
        name: 'Bananas',
        price: 50,
        image: '5.jpg',
        category: 'fruits',
        description: 'Ripe, sweet bananas high in potassium and other nutrients.',
        inventory: 120,
        unit: 'kg',
        isLiquid: false
    },
    {
        name: 'Dairy Milk',
        price: 51,
        image: '5.jpg',
        category: 'dairy',
        description: 'Fresh, pasteurized milk from grass-fed cows.',
        inventory: 30,
        unit: 'Litre',
        isLiquid: true
    },
    {
        name: 'Cheese',
        price: 420,
        image: '4.jpg',
        category: 'dairy',
        description: 'Premium aged cheese made from the finest milk.',
        inventory: 45,
        unit: 'Kg',
        isLiquid: false
    }
];

// Connect to MongoDB
connectDB();

// Import data function
const importData = async () => {
    try {
        // Clear existing data
        await Product.deleteMany();
        
        // Insert new data
        await Product.insertMany(products);
        
        console.log('Data imported successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error importing data: ${error.message}`);
        process.exit(1);
    }
};

// Delete all data function
const destroyData = async () => {
    try {
        // Delete all existing data
        await Product.deleteMany();
        
        console.log('Data destroyed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error deleting data: ${error.message}`);
        process.exit(1);
    }
};

// Check for -d flag to destroy data
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
} 