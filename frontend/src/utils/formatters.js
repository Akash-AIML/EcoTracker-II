/**
 * Number and date formatting utilities
 */

/**
 * Format CO₂ emissions with appropriate unit
 * @param {number} kg - emissions in kg
 * @returns {string}
 */
export const formatEmission = (kg) => {
  if (kg === null || kg === undefined) return '—';
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tonnes`;
  }
  return `${Math.round(kg)} kg`;
};

/**
 * Format CO₂ emissions always in tonnes
 * @param {number} kg
 * @returns {string}
 */
export const formatEmissionTonnes = (kg) => {
  if (kg === null || kg === undefined) return '—';
  return `${(kg / 1000).toFixed(2)} t CO₂e`;
};

/**
 * Format a number with commas
 * @param {number} n
 * @returns {string}
 */
export const formatNumber = (n) => {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(n));
};

/**
 * Format percentage
 * @param {number} n - value 0-100
 * @returns {string}
 */
export const formatPercent = (n) => {
  if (n === null || n === undefined) return '—';
  return `${Math.round(n)}%`;
};

/**
 * Format a date to readable string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format a date to short format
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateShort = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format relative time (e.g. "2 days ago")
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Calculate percentage change between two values
 * @param {number} original
 * @param {number} updated
 * @returns {number} - positive = increase, negative = decrease
 */
export const percentChange = (original, updated) => {
  if (!original || original === 0) return 0;
  return ((updated - original) / original) * 100;
};

/**
 * Get score label and color
 * @param {number} score - 0-100
 * @returns {{ label: string, color: string, bgClass: string, textClass: string }}
 */
export const getScoreInfo = (score) => {
  if (score >= 90)
    return {
      label: 'Excellent',
      color: '#10b981',
      bgClass: 'bg-emerald-500/20',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/30',
    };
  if (score >= 70)
    return {
      label: 'Good',
      color: '#06b6d4',
      bgClass: 'bg-cyan-500/20',
      textClass: 'text-cyan-400',
      borderClass: 'border-cyan-500/30',
    };
  if (score >= 50)
    return {
      label: 'Moderate',
      color: '#f59e0b',
      bgClass: 'bg-amber-500/20',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500/30',
    };
  return {
    label: 'Needs Improvement',
    color: '#ef4444',
    bgClass: 'bg-rose-500/20',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
  };
};

/**
 * Get priority badge classes
 * @param {string} priority - HIGH | MEDIUM | LOW
 */
export const getPriorityInfo = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return {
        label: 'High Priority',
        bgClass: 'bg-rose-500/20',
        textClass: 'text-rose-400',
        borderClass: 'border-rose-500/30',
      };
    case 'MEDIUM':
      return {
        label: 'Medium Priority',
        bgClass: 'bg-amber-500/20',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500/30',
      };
    case 'LOW':
      return {
        label: 'Low Priority',
        bgClass: 'bg-sky-500/20',
        textClass: 'text-sky-400',
        borderClass: 'border-sky-500/30',
      };
    default:
      return {
        label: priority,
        bgClass: 'bg-slate-500/20',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-500/30',
      };
  }
};
