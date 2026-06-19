/**
 * Logger utility
 * Wraps console methods and silences all output in production.
 * Use this instead of raw console.log / console.error throughout the app.
 */

const IS_PROD = import.meta.env.PROD;

const noop = () => {};

const logger = {
  /** @param {...*} args */
  log: IS_PROD ? noop : (...args) => console.log('[EcoGuide]', ...args),

  /** @param {...*} args */
  warn: IS_PROD ? noop : (...args) => console.warn('[EcoGuide]', ...args),

  /** @param {...*} args */
  error: IS_PROD ? noop : (...args) => console.error('[EcoGuide]', ...args),

  /** @param {...*} args */
  info: IS_PROD ? noop : (...args) => console.info('[EcoGuide]', ...args),
};

export default logger;
