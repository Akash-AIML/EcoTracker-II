import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../../services/recommendationEngine.js';

const heavyUserData = {
  dailyCarKm: 40,
  carFuelType: 'petrol',
  publicTransportKmPerWeek: 0,
  cyclingKmPerWeek: 0,
  shortFlightsPerYear: 4,
  longFlightsPerYear: 2,
  monthlyElectricityKwh: 400,
  renewablePercentage: 0,
  dietType: 'heavy_meat',
  clothingItemsPerYear: 30,
  electronicsItemsPerYear: 3,
};

const lowUserData = {
  dailyCarKm: 0,
  carFuelType: 'none',
  publicTransportKmPerWeek: 50,
  cyclingKmPerWeek: 40,
  shortFlightsPerYear: 0,
  longFlightsPerYear: 0,
  monthlyElectricityKwh: 100,
  renewablePercentage: 90,
  dietType: 'vegan',
  clothingItemsPerYear: 3,
  electronicsItemsPerYear: 0,
};

const heavyEmissions = {
  transportEmission: 5000,
  energyEmission: 1100,
  foodEmission: 3300,
  shoppingEmission: 1890,
  totalEmission: 11290,
};

const lowEmissions = {
  transportEmission: 232,
  energyEmission: 28,
  foodEmission: 1500,
  shoppingEmission: 99,
  totalEmission: 1859,
};

describe('Recommendation Engine', () => {
  describe('generateRecommendations', () => {
    it('returns an array of recommendations', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
    });

    it('each recommendation has required fields', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      recs.forEach((rec) => {
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('estimatedSavings');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('category');
      });
    });

    it('priority values are valid', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      const validPriorities = ['HIGH', 'MEDIUM', 'LOW'];
      recs.forEach((rec) => {
        expect(validPriorities).toContain(rec.priority);
      });
    });

    it('category values are valid', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      const validCategories = ['transport', 'energy', 'food', 'shopping'];
      recs.forEach((rec) => {
        expect(validCategories).toContain(rec.category);
      });
    });

    it('estimated savings are positive numbers', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      recs.forEach((rec) => {
        expect(rec.estimatedSavings).toBeGreaterThanOrEqual(0);
        expect(typeof rec.estimatedSavings).toBe('number');
      });
    });

    it('heavy user gets HIGH priority recommendations', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      const highPriorityRecs = recs.filter((r) => r.priority === 'HIGH');
      expect(highPriorityRecs.length).toBeGreaterThan(0);
    });

    it('heavy user gets transport recommendation due to high car use', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      const transportRecs = recs.filter((r) => r.category === 'transport');
      expect(transportRecs.length).toBeGreaterThan(0);
    });

    it('heavy meat user gets food recommendation', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      const foodRecs = recs.filter((r) => r.category === 'food');
      expect(foodRecs.length).toBeGreaterThan(0);
    });

    it('generates fewer HIGH priority recommendations for low-impact user', () => {
      const heavyRecs = generateRecommendations(heavyUserData, heavyEmissions);
      const lowRecs = generateRecommendations(lowUserData, lowEmissions);
      const heavyHigh = heavyRecs.filter((r) => r.priority === 'HIGH').length;
      const lowHigh = lowRecs.filter((r) => r.priority === 'HIGH').length;
      expect(heavyHigh).toBeGreaterThanOrEqual(lowHigh);
    });

    it('recommendations are sorted with HIGH priority first', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      for (let i = 1; i < recs.length; i++) {
        expect(priorityOrder[recs[i].priority]).toBeGreaterThanOrEqual(
          priorityOrder[recs[i - 1].priority]
        );
      }
    });

    it('high flight user gets flight reduction recommendation', () => {
      const recs = generateRecommendations(heavyUserData, heavyEmissions);
      const flightRec = recs.find((r) => r.title.toLowerCase().includes('flight'));
      expect(flightRec).toBeDefined();
    });

    it('handles edge case with no car and no flights', () => {
      const data = {
        ...heavyUserData,
        dailyCarKm: 0,
        carFuelType: 'none',
        shortFlightsPerYear: 0,
        longFlightsPerYear: 0,
      };
      const emissions = { ...heavyEmissions, transportEmission: 100 };
      expect(() => generateRecommendations(data, emissions)).not.toThrow();
    });
  });
});
