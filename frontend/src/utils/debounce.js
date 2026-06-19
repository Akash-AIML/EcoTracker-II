/**
 * Debounce utility
 * Delays invoking `fn` until after `wait` ms have elapsed since the last call.
 *
 * @param {Function} fn - function to debounce
 * @param {number} wait - delay in milliseconds (default 300)
 * @returns {Function} debounced function
 */
export function debounce(fn, wait = 300) {
  let timeoutId = null;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}
