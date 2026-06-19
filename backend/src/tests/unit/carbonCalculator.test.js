import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmission,
  calculateEnergyEmission,
  calculateFoodEmission,
  calculateShoppingEmission,
  calculateAllEmissions,
} from '../../services/carbonCalculator.js';

describe('Carbon Calculator Service', () => {
  describe('calculateTransportEmission', () => {
    it('returns 0 for no inputs', () => {
      expect(calculateTransportEmission({})).toBe(0);
    });

    it('calculates petrol car emission correctly', () => {
      const result = calculateTransportEmission({ dailyCarKm: 20, carFuelType: 'petrol' });
      // 20 km * 0.21 kg/km * 365 days = 1533 kg
      expect(result).toBeCloseTo(1533, 0);
    });

    it('calculates electric car emission correctly', () => {
      const result = calculateTransportEmission({ dailyCarKm: 20, carFuelType: 'electric' });
      // 20 km * 0.047 kg/km * 365 days = 343.1 kg
      expect(result).toBeCloseTo(343.1, 0);
    });

    it('electric car has lower emission than petrol car', () => {
      const petrol = calculateTransportEmission({ dailyCarKm: 20, carFuelType: 'petrol' });
      const electric = calculateTransportEmission({ dailyCarKm: 20, carFuelType: 'electric' });
      expect(electric).toBeLessThan(petrol);
    });

    it('calculates flight emission correctly', () => {
      const result = calculateTransportEmission({ shortFlightsPerYear: 2, longFlightsPerYear: 1 });
      // 2 * 255 + 1 * 1620 = 510 + 1620 = 2130 kg
      expect(result).toBeCloseTo(2130, 0);
    });

    it('calculates public transport emission correctly', () => {
      const result = calculateTransportEmission({ publicTransportKmPerWeek: 100 });
      // 100 * 52 * 0.089 = 462.8 kg
      expect(result).toBeCloseTo(462.8, 0);
    });

    it('handles carFuelType none correctly', () => {
      const result = calculateTransportEmission({ dailyCarKm: 50, carFuelType: 'none' });
      expect(result).toBe(0);
    });

    it('sums all transport sources', () => {
      const data = {
        dailyCarKm: 10,
        carFuelType: 'petrol',
        publicTransportKmPerWeek: 50,
        shortFlightsPerYear: 1,
        longFlightsPerYear: 0,
      };
      const car = 10 * 0.21 * 365;
      const pt = 50 * 52 * 0.089;
      const flights = 255;
      expect(calculateTransportEmission(data)).toBeCloseTo(car + pt + flights, 0);
    });
  });

  describe('calculateEnergyEmission', () => {
    it('returns 0 for no electricity', () => {
      expect(calculateEnergyEmission({ monthlyElectricityKwh: 0 })).toBe(0);
    });

    it('calculates grid electricity emission correctly', () => {
      const result = calculateEnergyEmission({
        monthlyElectricityKwh: 200,
        renewablePercentage: 0,
      });
      // 200 * 12 * 0.233 = 559.2 kg
      expect(result).toBeCloseTo(559.2, 0);
    });

    it('reduces emission with renewable energy', () => {
      const fullGrid = calculateEnergyEmission({
        monthlyElectricityKwh: 200,
        renewablePercentage: 0,
      });
      const halfRenewable = calculateEnergyEmission({
        monthlyElectricityKwh: 200,
        renewablePercentage: 50,
      });
      const fullRenewable = calculateEnergyEmission({
        monthlyElectricityKwh: 200,
        renewablePercentage: 100,
      });
      expect(halfRenewable).toBeCloseTo(fullGrid / 2, 0);
      expect(fullRenewable).toBe(0);
    });

    it('caps renewable percentage at 100', () => {
      const result = calculateEnergyEmission({
        monthlyElectricityKwh: 200,
        renewablePercentage: 150,
      });
      expect(result).toBe(0);
    });
  });

  describe('calculateFoodEmission', () => {
    it('returns correct values for each diet type', () => {
      expect(calculateFoodEmission({ dietType: 'vegan' })).toBe(1500);
      expect(calculateFoodEmission({ dietType: 'vegetarian' })).toBe(1700);
      expect(calculateFoodEmission({ dietType: 'mixed' })).toBe(2500);
      expect(calculateFoodEmission({ dietType: 'heavy_meat' })).toBe(3300);
    });

    it('defaults to mixed diet', () => {
      expect(calculateFoodEmission({})).toBe(2500);
    });

    it('vegan diet has lowest emission', () => {
      const vegan = calculateFoodEmission({ dietType: 'vegan' });
      const heavy = calculateFoodEmission({ dietType: 'heavy_meat' });
      expect(vegan).toBeLessThan(heavy);
    });
  });

  describe('calculateShoppingEmission', () => {
    it('returns 0 for no shopping', () => {
      expect(calculateShoppingEmission({})).toBe(0);
    });

    it('calculates clothing emission correctly', () => {
      const result = calculateShoppingEmission({ clothingItemsPerYear: 10 });
      // 10 * 33 = 330 kg
      expect(result).toBe(330);
    });

    it('calculates electronics emission correctly', () => {
      const result = calculateShoppingEmission({ electronicsItemsPerYear: 2 });
      // 2 * 300 = 600 kg
      expect(result).toBe(600);
    });

    it('sums clothing and electronics', () => {
      const result = calculateShoppingEmission({
        clothingItemsPerYear: 5,
        electronicsItemsPerYear: 1,
      });
      // 5 * 33 + 1 * 300 = 165 + 300 = 465
      expect(result).toBe(465);
    });
  });

  describe('calculateAllEmissions', () => {
    it('returns all emission categories', () => {
      const result = calculateAllEmissions({ dietType: 'mixed' });
      expect(result).toHaveProperty('transportEmission');
      expect(result).toHaveProperty('energyEmission');
      expect(result).toHaveProperty('foodEmission');
      expect(result).toHaveProperty('shoppingEmission');
      expect(result).toHaveProperty('totalEmission');
      expect(result).toHaveProperty('breakdown');
    });

    it('total equals sum of categories', () => {
      const data = {
        dailyCarKm: 15,
        carFuelType: 'petrol',
        monthlyElectricityKwh: 250,
        renewablePercentage: 20,
        dietType: 'mixed',
        clothingItemsPerYear: 8,
        electronicsItemsPerYear: 1,
      };
      const result = calculateAllEmissions(data);
      const sum =
        result.transportEmission +
        result.energyEmission +
        result.foodEmission +
        result.shoppingEmission;
      expect(result.totalEmission).toBe(Math.round(sum));
    });

    it('breakdown percentages sum to approximately 100', () => {
      const result = calculateAllEmissions({
        dailyCarKm: 10,
        carFuelType: 'petrol',
        monthlyElectricityKwh: 200,
        dietType: 'mixed',
        clothingItemsPerYear: 5,
      });
      const sum =
        result.breakdown.transport +
        result.breakdown.energy +
        result.breakdown.food +
        result.breakdown.shopping;
      expect(sum).toBeCloseTo(100, 0);
    });

    it('returns rounded integer values', () => {
      const result = calculateAllEmissions({ dietType: 'vegan' });
      expect(Number.isInteger(result.transportEmission)).toBe(true);
      expect(Number.isInteger(result.foodEmission)).toBe(true);
      expect(Number.isInteger(result.totalEmission)).toBe(true);
    });
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────────
  describe('Edge Cases', () => {
    it('zero inputs return zero for transport, energy, shopping', () => {
      const result = calculateAllEmissions({
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
      expect(result.transportEmission).toBe(0);
      expect(result.energyEmission).toBe(0);
      expect(result.shoppingEmission).toBe(0);
      expect(result.foodEmission).toBe(1500); // vegan diet always has baseline
    });

    it('unknown carFuelType falls back to 0 emission factor', () => {
      const result = calculateTransportEmission({ dailyCarKm: 20, carFuelType: 'hydrogen' });
      expect(result).toBe(0); // unknown type → ?? 0
    });

    it('unknown dietType falls back to mixed diet emission', () => {
      const result = calculateFoodEmission({ dietType: 'carnivore' });
      expect(result).toBe(2500); // fallback to mixed
    });

    it('very large dailyCarKm does not crash', () => {
      expect(() =>
        calculateTransportEmission({ dailyCarKm: 999999, carFuelType: 'petrol' })
      ).not.toThrow();
      const result = calculateTransportEmission({ dailyCarKm: 999999, carFuelType: 'petrol' });
      expect(result).toBeGreaterThan(0);
      expect(isFinite(result)).toBe(true);
    });

    it('renewablePercentage clamped to 100 eliminates energy emission', () => {
      const result = calculateEnergyEmission({
        monthlyElectricityKwh: 500,
        renewablePercentage: 999,
      });
      expect(result).toBe(0);
    });

    it('breakdown percentages are non-negative', () => {
      const result = calculateAllEmissions({ dietType: 'mixed' });
      Object.values(result.breakdown).forEach((pct) => {
        expect(pct).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
