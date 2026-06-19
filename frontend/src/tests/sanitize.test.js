import { describe, it, expect } from 'vitest';
import { sanitizeNumber, sanitizeInteger, sanitizeText } from '../utils/sanitize';

describe('sanitize utilities', () => {
  describe('sanitizeNumber', () => {
    it('returns the value when within range', () => {
      expect(sanitizeNumber(50, 0, 100)).toBe(50);
    });

    it('clamps value to min when below range', () => {
      expect(sanitizeNumber(-10, 0, 100)).toBe(0);
    });

    it('clamps value to max when above range', () => {
      expect(sanitizeNumber(200, 0, 100)).toBe(100);
    });

    it('returns min for NaN input', () => {
      expect(sanitizeNumber('abc', 0, 100)).toBe(0);
    });

    it('returns min for null input', () => {
      expect(sanitizeNumber(null, 0, 100)).toBe(0);
    });

    it('returns min for undefined input', () => {
      expect(sanitizeNumber(undefined, 0, 100)).toBe(0);
    });

    it('parses string numbers correctly', () => {
      expect(sanitizeNumber('42.5', 0, 100)).toBeCloseTo(42.5);
    });

    it('handles 0 correctly', () => {
      expect(sanitizeNumber(0, 0, 100)).toBe(0);
    });
  });

  describe('sanitizeInteger', () => {
    it('rounds floats to nearest integer', () => {
      expect(sanitizeInteger(4.7, 0, 10)).toBe(5);
    });

    it('clamps integer to max', () => {
      expect(sanitizeInteger(150, 0, 100)).toBe(100);
    });

    it('returns min for NaN', () => {
      expect(sanitizeInteger('xyz', 0, 50)).toBe(0);
    });
  });

  describe('sanitizeText', () => {
    it('strips HTML tags', () => {
      expect(sanitizeText('<script>alert(1)</script>hello')).toBe('hello');
    });

    it('strips HTML tags with attributes', () => {
      expect(sanitizeText('<img src="x" onerror="alert(1)">clean')).toBe('clean');
    });

    it('enforces max length', () => {
      expect(sanitizeText('hello world', 5)).toBe('hello');
    });

    it('trims whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(123)).toBe('');
    });

    it('handles empty string', () => {
      expect(sanitizeText('')).toBe('');
    });
  });
});
