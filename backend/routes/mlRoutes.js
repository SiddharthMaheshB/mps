import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createPrediction,
    getUserPredictions,
    getPredictionById,
    getPredictionsByType,
    getPredictionStats
} from '../controllers/mlController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/predict').post(createPrediction);
router.route('/predictions').get(getUserPredictions);
router.route('/predictions/:id').get(getPredictionById);
router.route('/predictions/type/:modelType').get(getPredictionsByType);
router.route('/stats').get(getPredictionStats);

export default router; 