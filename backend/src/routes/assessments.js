import { Router } from 'express';
import {
  createAssessment,
  getAssessmentById,
  getAssessmentsByUser,
  compareAssessment,
} from '../controllers/assessmentController.js';
import { assessmentLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @route   POST /api/assessments
 * @desc    Create a new carbon footprint assessment
 * @access  Public
 */
router.post('/', assessmentLimiter, createAssessment);

/**
 * @route   GET /api/assessments/user/:userId
 * @desc    Get all assessments for a user
 * @access  Public
 * NOTE: This route must come before /:id to avoid param conflicts
 */
router.get('/user/:userId', getAssessmentsByUser);

/**
 * @route   GET /api/assessments/:id/compare
 * @desc    Compare an assessment's footprint against global, UK, and Paris Agreement averages
 * @access  Public
 * NOTE: This route must come before /:id to avoid param conflicts
 */
router.get('/:id/compare', compareAssessment);

/**
 * @route   GET /api/assessments/:id
 * @desc    Get a specific assessment by ID
 * @access  Public
 */
router.get('/:id', getAssessmentById);

export default router;
