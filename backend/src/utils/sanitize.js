/**
 * Utility to sanitize text inputs against XSS and HTML injection.
 * Strips script tags, style tags, and all other HTML markup recursively.
 *
 * @param {string} text - Raw input string.
 * @returns {string} Cleaned, sanitized, and trimmed string.
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';

  let cleaned = text;
  let previous;

  do {
    previous = cleaned;
    cleaned = cleaned
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/<[^>]*>/g, '');
  } while (cleaned !== previous);

  return cleaned.trim();
}
