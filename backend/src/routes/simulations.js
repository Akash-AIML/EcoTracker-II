import { Router } from 'express';
import { createSimulation, getSimulationById } from '../controllers/simulationController.js';

const router = Router();

/**
 * @route   POST /api/simulations
 * @desc    Run a carbon impact simulation scenario
 * @access  Public
 */
router.post('/', createSimulation);

/**
 * @route   GET /api/simulations/:id
 * @desc    Get a simulation result by ID
 * @access  Public
 */
router.get('/:id', getSimulationById);

export default router;
