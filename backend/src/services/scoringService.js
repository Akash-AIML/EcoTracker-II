/**
 * Sustainability Scoring Service
 * Scores are 0–100 based on total annual CO₂ emissions
 */

// Reference points (kg CO₂ per year)
const BENCHMARKS = {
  target: 2000, // Paris Agreement 2050 target per person
  excellent: 3000, // 90+ score threshold
  good: 5000, // 70+ score threshold
  moderate: 7500, // 50+ score threshold
  poor: 12000, // 0 score threshold (12 tonnes = very high footprint)
};

/**
 * Calculate sustainability score (0-100) from total annual emissions
 * Uses piecewise linear interpolation between benchmarks
 * @param {number} totalEmissionKg - annual CO₂ in kg
 * @returns {number} score 0-100
 */
export function calculateScore(totalEmissionKg) {
  const kg = Math.max(0, totalEmissionKg);

  if (kg <= BENCHMARKS.target) return 100;
  if (kg <= BENCHMARKS.excellent) {
    return Math.round(
      90 + ((BENCHMARKS.excellent - kg) / (BENCHMARKS.excellent - BENCHMARKS.target)) * 10
    );
  }
  if (kg <= BENCHMARKS.good) {
    return Math.round(
      70 + ((BENCHMARKS.good - kg) / (BENCHMARKS.good - BENCHMARKS.excellent)) * 20
    );
  }
  if (kg <= BENCHMARKS.moderate) {
    return Math.round(
      50 + ((BENCHMARKS.moderate - kg) / (BENCHMARKS.moderate - BENCHMARKS.good)) * 20
    );
  }
  if (kg >= BENCHMARKS.poor) return 0;
  return Math.round(((BENCHMARKS.poor - kg) / (BENCHMARKS.poor - BENCHMARKS.moderate)) * 50);
}

/**
 * Get score label and metadata
 * @param {number} score - 0-100
 * @returns {{ label: string, description: string, color: string }}
 */
export function getScoreLabel(score) {
  if (score >= 90) {
    return {
      label: 'Excellent',
      description:
        "Your carbon footprint is well below global targets. You're making a real difference!",
      color: '#10b981',
      tier: 'excellent',
    };
  }
  if (score >= 70) {
    return {
      label: 'Good',
      description:
        "You're doing better than most. A few targeted changes could get you to excellent.",
      color: '#06b6d4',
      tier: 'good',
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderate',
      description:
        "Your footprint is around the global average. There's meaningful room to improve.",
      color: '#f59e0b',
      tier: 'moderate',
    };
  }
  return {
    label: 'Needs Improvement',
    description:
      'Your footprint is above average. The recommendations below will help you reduce it significantly.',
    color: '#ef4444',
    tier: 'poor',
  };
}

/**
 * Compare footprint against benchmarks
 * @param {number} totalEmissionKg
 * @returns {Object} comparison object
 */
export function compareToAverages(totalEmissionKg) {
  const globalAvg = 4700;
  const ukAvg = 5500;
  const parisTarget = 2000;

  return {
    vsGlobalAverage: parseFloat((((totalEmissionKg - globalAvg) / globalAvg) * 100).toFixed(1)),
    vsUkAverage: parseFloat((((totalEmissionKg - ukAvg) / ukAvg) * 100).toFixed(1)),
    vsParisTarget: parseFloat((((totalEmissionKg - parisTarget) / parisTarget) * 100).toFixed(1)),
    globalAverage: globalAvg,
    ukAverage: ukAvg,
    parisTarget,
  };
}

export { BENCHMARKS };
