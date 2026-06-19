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
    .send({ name: 'Rec Test User', email: `rec-test-${Date.now()}@example.com` });
  testUserId = userRes.body.data.id;

  const assessRes = await request(app).post('/api/assessments').send({
    userId: testUserId,
    dailyCarKm: 30,
    carFuelType: 'petrol',
    shortFlightsPerYear: 4,
    longFlightsPerYear: 2,
    monthlyElectricityKwh: 350,
    renewablePercentage: 0,
    dietType: 'heavy_meat',
    clothingItemsPerYear: 25,
    electronicsItemsPerYear: 3,
  });
  testAssessmentId = assessRes.body.data.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Recommendations API Integration Tests', () => {
  describe('GET /api/recommendations/:assessmentId', () => {
    it('should return recommendations for an assessment', async () => {
      const res = await request(app).get(`/api/recommendations/${testAssessmentId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return count of recommendations', async () => {
      const res = await request(app).get(`/api/recommendations/${testAssessmentId}`);
      expect(res.body).toHaveProperty('count');
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('each recommendation should have required fields', async () => {
      const res = await request(app).get(`/api/recommendations/${testAssessmentId}`);
      res.body.data.forEach((rec) => {
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('estimatedSavings');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('category');
      });
    });

    it('should return 404 for non-existent assessment', async () => {
      const res = await request(app).get('/api/recommendations/nonexistent-id');
      expect(res.status).toBe(404);
    });

    it('heavy user should get HIGH priority recommendations', async () => {
      const res = await request(app).get(`/api/recommendations/${testAssessmentId}`);
      const highPriority = res.body.data.filter((r) => r.priority === 'HIGH');
      expect(highPriority.length).toBeGreaterThan(0);
    });
  });
});
