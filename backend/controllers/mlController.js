import asyncHandler from 'express-async-handler';
import MLPrediction from '../models/mlPredictionModel.js';


const createPrediction = asyncHandler(async (req, res) => {
    const { modelType, inputData, imageUrl, location } = req.body;

    // Here you would typically call your ML model service
    // For now, we'll simulate a prediction
    const mockPrediction = {
        result: 'Sample prediction',
        probability: 0.85
    };

    const prediction = await MLPrediction.create({
        userId: req.user._id,
        modelType,
        inputData,
        prediction: mockPrediction,
        confidence: mockPrediction.probability * 100,
        status: 'completed',
        imageUrl,
        metadata: {
            location,
            deviceInfo: req.headers['user-agent']
        }
    });

    res.status(201).json(prediction);
});

const getUserPredictions = asyncHandler(async (req, res) => {
    const predictions = await MLPrediction.find({ userId: req.user._id })
        .sort({ 'metadata.timestamp': -1 });
    res.json(predictions);
});

const getPredictionById = asyncHandler(async (req, res) => {
    const prediction = await MLPrediction.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (prediction) {
        res.json(prediction);
    } else {
        res.status(404);
        throw new Error('Prediction not found');
    }
});

const getPredictionsByType = asyncHandler(async (req, res) => {
    const predictions = await MLPrediction.find({
        userId: req.user._id,
        modelType: req.params.modelType
    }).sort({ 'metadata.timestamp': -1 });

    res.json(predictions);
});

const getPredictionStats = asyncHandler(async (req, res) => {
    const stats = await MLPrediction.aggregate([
        { $match: { userId: req.user._id } },
        {
            $group: {
                _id: '$modelType',
                count: { $sum: 1 },
                avgConfidence: { $avg: '$confidence' },
                lastPrediction: { $max: '$metadata.timestamp' }
            }
        }
    ]);

    res.json(stats);
});

export {
    createPrediction,
    getUserPredictions,
    getPredictionById,
    getPredictionsByType,
    getPredictionStats
}; 