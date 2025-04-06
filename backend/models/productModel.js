import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inventory: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        default: 'kg'
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'Other'
    },
    image: {
        type: String,
        default: '/placeholder-product.jpg'
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