// Set environment to test to route DB writes to database.test.json
process.env.NODE_ENV = 'test';

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');

describe('EcoTrack AI Backend API integration Tests', () => {
  
  afterAll((done) => {
    // Clean up temporary database.test.json after test suite completes
    const testDbPath = path.join(__dirname, '../database.test.json');
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (err) {
        console.error('Error cleaning up test DB file:', err);
      }
    }
    done();
  });

  // 1. Health check endpoint
  describe('GET /', () => {
    it('should return 200 OK with server status and local-mock database tag', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'online');
      expect(res.body).toHaveProperty('service');
    });
  });

  // 2. Preset configs loader
  describe('GET /api/config', () => {
    it('should return transport and electric multipliers presets', async () => {
      const res = await request(app).get('/api/config');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('factors');
      expect(res.body).toHaveProperty('multipliers');
    });
  });

  // 3. Carbon Calculator computations
  describe('POST /api/carbon/calculate', () => {
    it('should compute carbon metrics based on weights', async () => {
      const calculationPayload = {
        transport: { mode: 'car', distance: 100, fuelType: 'gasoline', daysPerWeek: 5 },
        electricity: { units: 200 },
        food: { type: 'vegetarian' },
        waste: { plasticUsage: 5, recyclingHabits: 'partial' },
        shopping: { clothes: 2, onlineOrders: 5, electronics: 0 }
      };

      const res = await request(app)
        .post('/api/carbon/calculate')
        .send(calculationPayload);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('monthlyEmission');
      expect(res.body).toHaveProperty('yearlyEmission');
      expect(res.body.breakdown).toHaveProperty('transport');
      expect(res.body.breakdown).toHaveProperty('electricity');
      expect(res.body.breakdown).toHaveProperty('food');
      expect(res.body.breakdown).toHaveProperty('waste');
      expect(res.body.breakdown).toHaveProperty('shopping');
    });
  });

  // 4. User registration & verification
  describe('POST /api/users', () => {
    it('should register a new valid user and generate profile document', async () => {
      const payload = {
        name: 'Testy Tester',
        email: 'test@example.com'
      };

      const res = await request(app)
        .post('/api/users')
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('userId', 'testy_tester');
      expect(res.body.profile).toHaveProperty('name', 'Testy Tester');
      expect(res.body.profile).toHaveProperty('email', 'test@example.com');
      expect(res.body.profile).toHaveProperty('points', 0);
    });

    it('should reject requests with empty name parameters', async () => {
      const payload = {
        name: '   ',
        email: 'test@example.com'
      };

      const res = await request(app)
        .post('/api/users')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject requests with malformed email strings', async () => {
      const payload = {
        name: 'Akash Test',
        email: 'invalid-email-address'
      };

      const res = await request(app)
        .post('/api/users')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject names longer than 50 characters', async () => {
      const payload = {
        name: 'A'.repeat(51),
        email: 'long@example.com'
      };

      const res = await request(app)
        .post('/api/users')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // 5. User retrieval and Leaderboard syncing
  describe('GET /api/users & GET /api/leaderboard', () => {
    it('should retrieve a list of all user profiles', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return a sorted ranked leaderboard list with ID parameters', async () => {
      const res = await request(app).get('/api/leaderboard');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('rank');
      expect(res.body[0]).toHaveProperty('points');
    });
  });

});
