import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['vegetables', 'fruits', 'dairy', 'grains', 'seeds', 'tools']
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    inventory: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        default: 'kg'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

// Indexes for faster queries
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product; 