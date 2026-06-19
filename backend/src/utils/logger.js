/**
 * Structured logger utility
 * Uses console with structured JSON output in production
 */

const isDev = process.env.NODE_ENV !== 'production';

function formatMessage(level, message, meta = {}) {
  if (isDev) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (Object.keys(meta).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(meta, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }
  return JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta });
}

const logger = {
  error: (message, meta) => console.error(formatMessage('error', message, meta)),
  warn: (message, meta) => console.warn(formatMessage('warn', message, meta)),
  info: (message, meta) => console.info(formatMessage('info', message, meta)),
  debug: (message, meta) => {
    if (isDev) console.debug(formatMessage('debug', message, meta));
  },
};

export default logger;
