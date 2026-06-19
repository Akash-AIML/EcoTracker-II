/**
 * Input sanitization utilities
 * Strips HTML, enforces length limits, and validates numeric ranges.
 */

/**
 * Clamp a numeric value within a valid range, rejecting NaN.
 * @param {*} val - raw value (string or number)
 * @param {number} min - minimum allowed value (inclusive)
 * @param {number} max - maximum allowed value (inclusive)
 * @returns {number} safe clamped number, or 0 on invalid input
 */
export function sanitizeNumber(val, min = 0, max = Infinity) {
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  if (!isFinite(n) || isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/**
 * Clamp a numeric value as an integer.
 * @param {*} val - raw value
 * @param {number} min
 * @param {number} max
 * @returns {number} safe integer
 */
export function sanitizeInteger(val, min = 0, max = Infinity) {
  const n = typeof val === 'string' ? parseInt(val, 10) : Math.round(Number(val));
  if (!isFinite(n) || isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/**
 * Strip HTML tags and trim a string, enforcing a max length.
 * @param {string} str - raw string input
 * @param {number} maxLen - maximum allowed length
 * @returns {string} sanitized string
 */
export function sanitizeText(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script[^>]*>.*?<\/script>/gis, '') // strip <script> blocks entirely
    .replace(/<style[^>]*>.*?<\/style>/gis, '') // strip <style> blocks entirely
    .replace(/<[^>]*>/g, '') // strip remaining HTML tags
    .trim()
    .slice(0, maxLen);
}
