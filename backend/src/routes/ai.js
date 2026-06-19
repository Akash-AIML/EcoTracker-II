import { Router } from 'express';
import { aiService } from '../services/aiService.js';
import { sanitizeText } from '../utils/sanitize.js';

const router = Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with the AI sustainability coach
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, context } = req.body;
    const sanitizedMsg = sanitizeText(message);
    const result = await aiService.chat(sanitizedMsg, context);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/ai/plan
 * @desc    Generate a 30-day net-zero action plan
 */
router.post('/plan', async (req, res, next) => {
  try {
    const { footprint, breakdown, goal } = req.body;
    const sanitizedGoal = goal ? sanitizeText(goal) : '20% reduction';
    const result = await aiService.generatePlan(footprint, breakdown, sanitizedGoal);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/ai/tip
 * @desc    Get daily sustainability tip (cached 24h)
 */
router.get('/tip', async (req, res, next) => {
  try {
    const result = await aiService.getDailyTip();
    res.json({ success: true, tip: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/ai/score
 * @desc    Get carbon score evaluation feedback
 */
router.post('/score', async (req, res, next) => {
  try {
    const { score, breakdown } = req.body;
    const result = await aiService.getScoreFeedback(score, breakdown);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/ai/compare
 * @desc    Get narrative footprint average comparison feedback
 */
router.post('/compare', async (req, res, next) => {
  try {
    const { totalEmission, breakdown } = req.body;
    const result = await aiService.getCompareNarrative(totalEmission, breakdown);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

export default router;
