import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';

const router = Router();

/**
 * @route   GET /api/recommendations/:assessmentId
 * @desc    Get recommendations for an assessment
 * @access  Public
 */
router.get('/:assessmentId', getRecommendations);

export default router;
