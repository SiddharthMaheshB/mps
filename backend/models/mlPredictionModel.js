import mongoose from 'mongoose';

const mlPredictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modelType: {
        type: String,
        required: true,
        enum: ['pest-disease', 'fertilizer', 'crop-yield', 'irrigation', 'soil-analysis']
    },
    inputData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    prediction: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    confidence: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    imageUrl: {
        type: String,
        required: false
    },
    metadata: {
        location: {
            type: {
                latitude: Number,
                longitude: Number
            },
            required: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        deviceInfo: {
            type: String,
            required: false
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
mlPredictionSchema.index({ userId: 1, modelType: 1 });
mlPredictionSchema.index({ status: 1 });
mlPredictionSchema.index({ "metadata.timestamp": -1 });

const MLPrediction = mongoose.model('MLPrediction', mlPredictionSchema);
export default MLPrediction; 