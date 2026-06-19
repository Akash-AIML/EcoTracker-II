import { describe, it, expect, beforeEach } from 'vitest';
import { getCacheKey, getFromCache, setInCache, clearCache } from '../utils/calculationCache';

describe('calculationCache utility', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('getCacheKey', () => {
    it('produces the same key for identical objects regardless of key order', () => {
      const a = { userId: '1', dailyCarKm: 10, dietType: 'vegan' };
      const b = { dietType: 'vegan', dailyCarKm: 10, userId: '1' };
      expect(getCacheKey(a)).toBe(getCacheKey(b));
    });

    it('produces different keys for different objects', () => {
      const a = { dailyCarKm: 10 };
      const b = { dailyCarKm: 20 };
      expect(getCacheKey(a)).not.toBe(getCacheKey(b));
    });
  });

  describe('cache hit / miss', () => {
    it('returns undefined for a cache miss', () => {
      const key = getCacheKey({ dailyCarKm: 5 });
      expect(getFromCache(key)).toBeUndefined();
    });

    it('returns the stored value for a cache hit', () => {
      const key = getCacheKey({ dailyCarKm: 5 });
      const value = { totalEmission: 1200 };
      setInCache(key, value);
      expect(getFromCache(key)).toBe(value);
    });

    it('overwrites existing entry with the same key', () => {
      const key = getCacheKey({ dailyCarKm: 5 });
      setInCache(key, { totalEmission: 1000 });
      setInCache(key, { totalEmission: 2000 });
      expect(getFromCache(key)).toEqual({ totalEmission: 2000 });
    });
  });

  describe('clearCache', () => {
    it('removes all cached entries', () => {
      const key = getCacheKey({ dailyCarKm: 5 });
      setInCache(key, { totalEmission: 1200 });
      clearCache();
      expect(getFromCache(key)).toBeUndefined();
    });
  });
});
