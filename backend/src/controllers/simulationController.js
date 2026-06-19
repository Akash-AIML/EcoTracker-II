import { z } from 'zod';
import db from '../utils/firebaseClient.js';
import { runSimulation } from '../services/simulationService.js';
import { AppError } from '../middleware/errorHandler.js';
import { sanitizeText } from '../utils/sanitize.js';
import crypto from 'crypto';

const simulationSchema = z.object({
  assessmentId: z.string().min(1, 'assessmentId is required'),
  scenarioName: z.string().min(1, 'scenarioName is required').max(100),
  scenarioParams: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

export const createSimulation = async (req, res, next) => {
  try {
    const data = simulationSchema.parse(req.body);
    data.assessmentId = sanitizeText(data.assessmentId);
    data.scenarioName = sanitizeText(data.scenarioName);

    const assessmentDoc = await db.collection('assessments').doc(data.assessmentId).get();
    if (!assessmentDoc.exists) throw new AppError('Assessment not found', 404);

    const assessment = assessmentDoc.data();

    const assessmentData = {
      dailyCarKm: assessment.dailyCarKm,
      carFuelType: assessment.carFuelType,
      publicTransportKmPerWeek: assessment.publicTransportKmPerWeek,
      cyclingKmPerWeek: assessment.cyclingKmPerWeek,
      shortFlightsPerYear: assessment.shortFlightsPerYear,
      longFlightsPerYear: assessment.longFlightsPerYear,
      monthlyElectricityKwh: assessment.monthlyElectricityKwh,
      renewablePercentage: assessment.renewablePercentage,
      dietType: assessment.dietType,
      clothingItemsPerYear: assessment.clothingItemsPerYear,
      electronicsItemsPerYear: assessment.electronicsItemsPerYear,
    };

    const result = runSimulation(assessmentData, data.scenarioParams, data.scenarioName);

    const simId = crypto.randomUUID();
    const simulation = {
      id: simId,
      assessmentId: data.assessmentId,
      scenarioName: result.scenarioName,
      scenarioParams: result.scenarioParams,
      originalEmission: result.originalEmission,
      projectedEmission: result.projectedEmission,
      reductionPercentage: result.reductionPercentage,
      annualSavingsKg: result.annualSavingsKg,
      createdAt: new Date().toISOString(),
    };

    await db.collection('simulations').doc(simId).set(simulation);

    res.status(201).json({ success: true, data: { ...simulation, ...result } });
  } catch (err) {
    next(err);
  }
};

export const getSimulationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedId = sanitizeText(id);

    const simulationDoc = await db.collection('simulations').doc(sanitizedId).get();
    if (!simulationDoc.exists) throw new AppError('Simulation not found', 404);

    const simulation = simulationDoc.data();

    const assessmentDoc = await db.collection('assessments').doc(simulation.assessmentId).get();
    const assessment = assessmentDoc.exists ? assessmentDoc.data() : null;

    res.json({
      success: true,
      data: {
        ...simulation,
        id: sanitizedId,
        assessment: assessment
          ? {
              id: assessment.id || simulation.assessmentId,
              totalEmission: assessment.totalEmission,
              sustainabilityScore: assessment.sustainabilityScore,
              userId: assessment.userId,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};
