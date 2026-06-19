import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import prisma from '../../utils/prismaClient.js';
import { resetDb } from '../setup.js';

let testUserId;
let testAssessmentId;

// Re-seed fixtures before EVERY test so each test gets a clean DB with data.
// This prevents test-order dependencies and cures the beforeEach reset bug.
beforeEach(async () => {
  resetDb();

  const userRes = await request(app)
    .post('/api/users')
    .send({ name: 'Sim Test User', email: `sim-test-${Date.now()}@example.com` });
  testUserId = userRes.body.data.id;

  const assessRes = await request(app).post('/api/assessments').send({
    userId: testUserId,
    dailyCarKm: 25,
    carFuelType: 'petrol',
    shortFlightsPerYear: 3,
    longFlightsPerYear: 1,
    monthlyElectricityKwh: 300,
    renewablePercentage: 0,
    dietType: 'mixed',
    clothingItemsPerYear: 15,
    electronicsItemsPerYear: 2,
  });
  testAssessmentId = assessRes.body.data.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Simulations API Integration Tests', () => {
  describe('POST /api/simulations', () => {
    it('should run a simulation with valid data', async () => {
      const res = await request(app)
        .post('/api/simulations')
        .send({
          assessmentId: testAssessmentId,
          scenarioName: 'Switch to Electric Vehicle',
          scenarioParams: { carFuelType: 'electric' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('originalEmission');
      expect(res.body.data).toHaveProperty('projectedEmission');
      expect(res.body.data).toHaveProperty('reductionPercentage');
      expect(res.body.data).toHaveProperty('annualSavingsKg');
    });

    it('should show reduced emissions for EV switch', async () => {
      const res = await request(app)
        .post('/api/simulations')
        .send({
          assessmentId: testAssessmentId,
          scenarioName: 'Switch to Electric Vehicle',
          scenarioParams: { carFuelType: 'electric' },
        });

      expect(res.body.data.projectedEmission).toBeLessThan(res.body.data.originalEmission);
      expect(res.body.data.reductionPercentage).toBeGreaterThan(0);
    });

    it('should show reduced emissions for vegetarian diet', async () => {
      const res = await request(app)
        .post('/api/simulations')
        .send({
          assessmentId: testAssessmentId,
          scenarioName: 'Switch to Vegetarian Diet',
          scenarioParams: { dietType: 'vegetarian' },
        });

      expect(res.body.data.projectedEmission).toBeLessThan(res.body.data.originalEmission);
    });

    it('should show reduced emissions for flight reduction', async () => {
      const res = await request(app)
        .post('/api/simulations')
        .send({
          assessmentId: testAssessmentId,
          scenarioName: 'Reduce Flights by 50%',
          scenarioParams: { flightReductionFactor: 0.5 },
        });

      expect(res.body.data.annualSavingsKg).toBeGreaterThan(0);
    });

    it('should return 400 for missing assessmentId', async () => {
      const res = await request(app)
        .post('/api/simulations')
        .send({
          scenarioName: 'Test',
          scenarioParams: { carFuelType: 'electric' },
        });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent assessment', async () => {
      const res = await request(app).post('/api/simulations').send({
        assessmentId: 'nonexistent-id',
        scenarioName: 'Test',
        scenarioParams: {},
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/simulations/:id', () => {
    it('should retrieve a simulation by id', async () => {
      // Create a simulation first, then retrieve it
      const createRes = await request(app)
        .post('/api/simulations')
        .send({
          assessmentId: testAssessmentId,
          scenarioName: 'Solar Panels',
          scenarioParams: { renewablePercentage: 80 },
        });
      const simulationId = createRes.body.data.id;

      const res = await request(app).get(`/api/simulations/${simulationId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(simulationId);
    });

    it('should return 404 for non-existent simulation', async () => {
      const res = await request(app).get('/api/simulations/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });
});
