import { z } from 'zod';
import db from '../utils/firebaseClient.js';
import { compareToAverages } from '../services/scoringService.js';
import { createAssessmentWithRecommendations } from '../services/assessmentService.js';
import { AppError } from '../middleware/errorHandler.js';
import { sanitizeText } from '../utils/sanitize.js';

const assessmentSchema = z
  .object({
    userId: z.string().min(1, 'userId is required'),
    // Transportation
    dailyCarKm: z.number().min(0).max(1000).default(0),
    carFuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'none']).default('none'),
    publicTransportKmPerWeek: z.number().min(0).max(10000).default(0),
    cyclingKmPerWeek: z.number().min(0).max(1000).default(0),
    shortFlightsPerYear: z.number().int().min(0).max(100).default(0),
    longFlightsPerYear: z.number().int().min(0).max(50).default(0),
    // Energy
    monthlyElectricityKwh: z.number().min(0).max(10000).default(0),
    renewablePercentage: z.number().min(0).max(100).default(0),
    // Food
    dietType: z.enum(['vegan', 'vegetarian', 'mixed', 'heavy_meat']).default('mixed'),
    // Shopping
    clothingItemsPerYear: z.number().int().min(0).max(500).default(0),
    electronicsItemsPerYear: z.number().int().min(0).max(50).default(0),
  })
  .strict();

const PERCENTAGE_MULTIPLIER = 100;

function buildUnknownKeysMessage(zodError, allowedKeys) {
  const unknownKeyIssues = zodError.issues.filter((i) => i.code === 'unrecognized_keys');
  if (unknownKeyIssues.length === 0) return zodError.message;

  const unknownKeys = unknownKeyIssues.flatMap((i) => i.keys);
  return (
    `Unknown fields: ${unknownKeys.join(', ')}. ` +
    `Only these fields are accepted: ${allowedKeys.join(', ')}`
  );
}

const ALLOWED_KEYS = Object.keys(assessmentSchema._def.shape());

export const createAssessment = async (req, res, next) => {
  try {
    const parseResult = assessmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      const message = buildUnknownKeysMessage(parseResult.error, ALLOWED_KEYS);
      throw new AppError(message, 400);
    }
    const data = parseResult.data;
    data.userId = sanitizeText(data.userId);

    const { assessment, emissions, score } = await createAssessmentWithRecommendations(data);

    res.status(201).json({
      success: true,
      data: {
        ...assessment,
        breakdown: emissions.breakdown,
        scoreInfo: { score, ...emissions },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedId = sanitizeText(id);

    const assessmentDoc = await db.collection('assessments').doc(sanitizedId).get();
    if (!assessmentDoc.exists) throw new AppError('Assessment not found', 404);

    const assessment = assessmentDoc.data();

    // Fetch recommendations
    const recsSnap = await db
      .collection('recommendations')
      .where('assessmentId', '==', sanitizedId)
      .get();
    const recommendations = recsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    recommendations.sort((a, b) => (b.estimatedSavings || 0) - (a.estimatedSavings || 0));

    // Fetch simulations
    const simsSnap = await db
      .collection('simulations')
      .where('assessmentId', '==', sanitizedId)
      .get();
    const simulations = simsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    simulations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Fetch user
    const userDoc = await db.collection('users').doc(assessment.userId).get();
    const user = userDoc.exists
      ? { id: userDoc.id, name: userDoc.data().name, email: userDoc.data().email }
      : null;

    const total = assessment.totalEmission;
    const safeTotal = total === 0 ? 1 : total;

    res.json({
      success: true,
      data: {
        ...assessment,
        id: sanitizedId,
        recommendations,
        simulations,
        user,
        breakdown: {
          transport: parseFloat(
            ((assessment.transportEmission / safeTotal) * PERCENTAGE_MULTIPLIER).toFixed(1)
          ),
          energy: parseFloat(
            ((assessment.energyEmission / safeTotal) * PERCENTAGE_MULTIPLIER).toFixed(1)
          ),
          food: parseFloat(
            ((assessment.foodEmission / safeTotal) * PERCENTAGE_MULTIPLIER).toFixed(1)
          ),
          shopping: parseFloat(
            ((assessment.shoppingEmission / safeTotal) * PERCENTAGE_MULTIPLIER).toFixed(1)
          ),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAssessmentsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const sanitizedUserId = sanitizeText(userId);

    const userDoc = await db.collection('users').doc(sanitizedUserId).get();
    if (!userDoc.exists) throw new AppError('User not found', 404);

    const assessmentsSnap = await db
      .collection('assessments')
      .where('userId', '==', sanitizedUserId)
      .get();
    const assessments = assessmentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    assessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    for (const assessment of assessments) {
      const recsSnap = await db
        .collection('recommendations')
        .where('assessmentId', '==', assessment.id)
        .get();
      const recommendations = recsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      recommendations.sort((a, b) => (b.estimatedSavings || 0) - (a.estimatedSavings || 0));
      assessment.recommendations = recommendations.slice(0, 3);

      const simsSnap = await db
        .collection('simulations')
        .where('assessmentId', '==', assessment.id)
        .get();
      assessment._count = { simulations: simsSnap.docs.length };
    }

    res.json({ success: true, data: assessments, count: assessments.length });
  } catch (err) {
    next(err);
  }
};

export const compareAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedId = sanitizeText(id);

    const assessmentDoc = await db.collection('assessments').doc(sanitizedId).get();
    if (!assessmentDoc.exists) throw new AppError('Assessment not found', 404);

    const assessment = assessmentDoc.data();
    const comparison = compareToAverages(assessment.totalEmission);

    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

    res.json({
      success: true,
      data: {
        assessmentId: sanitizedId,
        totalEmission: assessment.totalEmission,
        sustainabilityScore: assessment.sustainabilityScore,
        comparison,
      },
    });
  } catch (err) {
    next(err);
  }
};
