import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import prisma from '../../utils/prismaClient.js';
import { resetDb } from '../setup.js';

let testUserId;
let testAssessmentId;

const validAssessmentData = {
  dailyCarKm: 15,
  carFuelType: 'petrol',
  publicTransportKmPerWeek: 20,
  cyclingKmPerWeek: 0,
  shortFlightsPerYear: 2,
  longFlightsPerYear: 1,
  monthlyElectricityKwh: 250,
  renewablePercentage: 10,
  dietType: 'mixed',
  clothingItemsPerYear: 10,
  electronicsItemsPerYear: 1,
};

// Seed a fresh user + assessment before every test for complete isolation
beforeEach(async () => {
  resetDb();

  const userRes = await request(app)
    .post('/api/users')
    .send({ name: 'Test User', email: `test-${Date.now()}@example.com` });
  testUserId = userRes.body.data.id;

  const assessRes = await request(app)
    .post('/api/assessments')
    .send({ ...validAssessmentData, userId: testUserId });
  testAssessmentId = assessRes.body.data.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Assessment API Integration Tests', () => {
  describe('POST /api/assessments', () => {
    it('should create an assessment with valid data', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: testUserId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('totalEmission');
      expect(res.body.data).toHaveProperty('sustainabilityScore');
      expect(res.body.data).toHaveProperty('recommendations');
      expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate non-zero emissions', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: testUserId });

      expect(res.body.data.totalEmission).toBeGreaterThan(0);
      expect(res.body.data.transportEmission).toBeGreaterThan(0);
      expect(res.body.data.foodEmission).toBeGreaterThan(0);
    });

    it('should return sustainability score between 0 and 100', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: testUserId });

      expect(res.body.data.sustainabilityScore).toBeGreaterThanOrEqual(0);
      expect(res.body.data.sustainabilityScore).toBeLessThanOrEqual(100);
    });

    it('should return 400 for invalid userId', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should auto-create user and succeed (201) for a non-existent userId', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: 'nonexistent-id' });

      // Auto-upsert creates the user on-the-fly — 201 is expected
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid fuel type', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: testUserId, carFuelType: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for negative car km', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: testUserId, dailyCarKm: -5 });

      expect(res.status).toBe(400);
    });

    it('should include breakdown in response', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: testUserId });

      expect(res.body.data).toHaveProperty('breakdown');
      expect(res.body.data.breakdown).toHaveProperty('transport');
      expect(res.body.data.breakdown).toHaveProperty('energy');
      expect(res.body.data.breakdown).toHaveProperty('food');
      expect(res.body.data.breakdown).toHaveProperty('shopping');
    });

    // ── Unknown-key guard tests ────────────────────────────────────────────
    it('should return 400 when request body contains unknown fields', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({
          ...validAssessmentData,
          userId: testUserId,
          hackerField: 'malicious',
          anotherBadField: 123,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unknown fields');
      expect(res.body.error).toContain('hackerField');
      expect(res.body.error).toContain('anotherBadField');
    });

    it('should return 400 with a single unknown field', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({
          ...validAssessmentData,
          userId: testUserId,
          isAdmin: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('isAdmin');
    });

    it('should accept valid data with no unknown fields', async () => {
      const res = await request(app)
        .post('/api/assessments')
        .send({ ...validAssessmentData, userId: testUserId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    // ── Edge cases ────────────────────────────────────────────────────────
    it('should handle zero-emission user (all zeros + vegan)', async () => {
      const res = await request(app).post('/api/assessments').send({
        userId: testUserId,
        dailyCarKm: 0,
        carFuelType: 'none',
        publicTransportKmPerWeek: 0,
        cyclingKmPerWeek: 0,
        shortFlightsPerYear: 0,
        longFlightsPerYear: 0,
        monthlyElectricityKwh: 0,
        renewablePercentage: 0,
        dietType: 'vegan',
        clothingItemsPerYear: 0,
        electronicsItemsPerYear: 0,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.transportEmission).toBe(0);
      expect(res.body.data.energyEmission).toBe(0);
      expect(res.body.data.shoppingEmission).toBe(0);
      // Vegan diet always has a baseline food emission
      expect(res.body.data.foodEmission).toBeGreaterThan(0);
      expect(res.body.data.sustainabilityScore).toBe(100);
    });

    it('should handle max-boundary values (dailyCarKm=1000, longFlightsPerYear=50)', async () => {
      const res = await request(app).post('/api/assessments').send({
        userId: testUserId,
        dailyCarKm: 1000,
        carFuelType: 'petrol',
        publicTransportKmPerWeek: 10000,
        cyclingKmPerWeek: 1000,
        shortFlightsPerYear: 100,
        longFlightsPerYear: 50,
        monthlyElectricityKwh: 10000,
        renewablePercentage: 100,
        dietType: 'heavy_meat',
        clothingItemsPerYear: 500,
        electronicsItemsPerYear: 50,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.totalEmission).toBeGreaterThan(0);
      expect(res.body.data.sustainabilityScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/assessments/:id', () => {
    it('should retrieve an existing assessment', async () => {
      const res = await request(app).get(`/api/assessments/${testAssessmentId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testAssessmentId);
    });

    it('should return 404 for non-existent assessment', async () => {
      const res = await request(app).get('/api/assessments/nonexistent-id');
      expect(res.status).toBe(404);
    });

    it('should include user info in response', async () => {
      const res = await request(app).get(`/api/assessments/${testAssessmentId}`);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id');
    });
  });

  describe('GET /api/assessments/user/:userId', () => {
    it('should retrieve assessments for a user', async () => {
      const res = await request(app).get(`/api/assessments/user/${testUserId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/assessments/user/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  // ── Compare endpoint tests ──────────────────────────────────────────────────
  describe('GET /api/assessments/:id/compare', () => {
    it('should return comparison data for an existing assessment', async () => {
      const res = await request(app).get(`/api/assessments/${testAssessmentId}/compare`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('assessmentId', testAssessmentId);
      expect(res.body.data).toHaveProperty('totalEmission');
      expect(res.body.data).toHaveProperty('sustainabilityScore');
      expect(res.body.data).toHaveProperty('comparison');
    });

    it('should return comparison object with all benchmark fields', async () => {
      const res = await request(app).get(`/api/assessments/${testAssessmentId}/compare`);
      const { comparison } = res.body.data;
      expect(comparison).toHaveProperty('vsGlobalAverage');
      expect(comparison).toHaveProperty('vsUkAverage');
      expect(comparison).toHaveProperty('vsParisTarget');
      expect(comparison).toHaveProperty('globalAverage');
      expect(comparison).toHaveProperty('ukAverage');
      expect(comparison).toHaveProperty('parisTarget');
    });

    it('should return numeric comparison percentages', async () => {
      const res = await request(app).get(`/api/assessments/${testAssessmentId}/compare`);
      const { comparison } = res.body.data;
      expect(typeof comparison.vsGlobalAverage).toBe('number');
      expect(typeof comparison.vsUkAverage).toBe('number');
      expect(typeof comparison.vsParisTarget).toBe('number');
    });

    it('should return correct benchmark constants', async () => {
      const res = await request(app).get(`/api/assessments/${testAssessmentId}/compare`);
      const { comparison } = res.body.data;
      expect(comparison.globalAverage).toBe(4700);
      expect(comparison.ukAverage).toBe(5500);
      expect(comparison.parisTarget).toBe(2000);
    });

    it('should return 404 for non-existent assessment', async () => {
      const res = await request(app).get('/api/assessments/nonexistent-id/compare');
      expect(res.status).toBe(404);
    });
  });

  // ── Permissions-Policy header test ──────────────────────────────────────────
  describe('Security Headers', () => {
    it('should include Permissions-Policy header', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['permissions-policy']).toBe(
        'camera=(), microphone=(), geolocation=(), payment=()'
      );
    });
  });
});
