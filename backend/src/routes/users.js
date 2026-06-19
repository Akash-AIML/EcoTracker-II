import { Router } from 'express';
import { createUser, getUserById, getLeaderboard } from '../controllers/userController.js';
import { createLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @route   POST /api/users
 * @desc    Create or find a user by email (upsert)
 * @access  Public
 */
router.post('/', createLimiter, createUser);

/**
 * @route   GET /api/users/leaderboard
 * @desc    Get top users leaderboard (paginated)
 * @access  Public
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', getUserById);

export default router;
