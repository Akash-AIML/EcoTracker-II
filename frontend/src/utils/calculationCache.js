/**
 * Calculation result cache
 * Memoizes carbon assessment API results using a JSON-keyed Map.
 * Prevents duplicate API calls for identical form inputs.
 */

const cache = new Map();

/** Maximum number of entries to keep in the cache */
const MAX_CACHE_SIZE = 50;

/**
 * Generate a stable cache key from an input object.
 * @param {Object} data - assessment input data
 * @returns {string} JSON key
 */
export function getCacheKey(data) {
  // Sort keys for stable serialization regardless of insertion order
  const sorted = Object.keys(data)
    .sort()
    .reduce((acc, k) => {
      acc[k] = data[k];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

/**
 * Retrieve a cached result.
 * @param {string} key - cache key from getCacheKey()
 * @returns {*} cached value, or undefined on cache miss
 */
export function getFromCache(key) {
  return cache.get(key);
}

/**
 * Store a result in the cache.
 * Evicts oldest entry if cache exceeds MAX_CACHE_SIZE.
 * @param {string} key - cache key
 * @param {*} value - result to store
 */
export function setInCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    // Evict oldest (first) entry
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, value);
}

/**
 * Clear all cached results.
 */
export function clearCache() {
  cache.clear();
}
