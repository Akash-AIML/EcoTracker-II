import { calculateAllEmissions } from './carbonCalculator.js';

/**
 * Simulation Service
 * Projects future emissions based on behavior change scenarios
 */

/**
 * Apply a simulation scenario to the original assessment data and calculate new emissions
 * @param {Object} assessmentData - original user inputs
 * @param {Object} scenarioParams - changes to apply
 * @param {string} scenarioName
 * @returns {Object} simulation result
 */
export function runSimulation(assessmentData, scenarioParams, scenarioName) {
  // Build modified data by applying scenario params
  const modifiedData = applyScenario(assessmentData, scenarioParams);

  // Calculate original and projected emissions
  const original = calculateAllEmissions(assessmentData);
  const projected = calculateAllEmissions(modifiedData);

  const originalTotal = original.totalEmission;
  const projectedTotal = projected.totalEmission;
  const savings = originalTotal - projectedTotal;
  const reductionPercentage =
    originalTotal > 0 ? parseFloat(((savings / originalTotal) * 100).toFixed(1)) : 0;

  return {
    scenarioName,
    scenarioParams,
    originalEmission: originalTotal,
    projectedEmission: projectedTotal,
    reductionPercentage,
    annualSavingsKg: Math.round(savings),
    categoryBreakdown: {
      original: {
        transport: original.transportEmission,
        energy: original.energyEmission,
        food: original.foodEmission,
        shopping: original.shoppingEmission,
      },
      projected: {
        transport: projected.transportEmission,
        energy: projected.energyEmission,
        food: projected.foodEmission,
        shopping: projected.shoppingEmission,
      },
    },
  };
}

/**
 * Apply scenario parameters to original assessment data
 * @param {Object} original
 * @param {Object} params
 * @returns {Object} modified assessment data
 */
function applyScenario(original, params) {
  const modified = { ...original };

  // Direct field overrides
  if (params.carFuelType !== undefined) modified.carFuelType = params.carFuelType;
  if (params.dietType !== undefined) modified.dietType = params.dietType;
  if (params.renewablePercentage !== undefined)
    modified.renewablePercentage = params.renewablePercentage;

  // Reduction factors
  if (params.cyclingReductionFactor !== undefined) {
    // Reduce daily car km by the cycling reduction factor
    modified.dailyCarKm = original.dailyCarKm * (1 - params.cyclingReductionFactor);
    modified.cyclingKmPerWeek =
      (original.cyclingKmPerWeek || 0) + original.dailyCarKm * params.cyclingReductionFactor * 5;
  }

  if (params.flightReductionFactor !== undefined) {
    modified.shortFlightsPerYear = Math.round(
      original.shortFlightsPerYear * (1 - params.flightReductionFactor)
    );
    modified.longFlightsPerYear = Math.round(
      original.longFlightsPerYear * (1 - params.flightReductionFactor)
    );
  }

  if (params.electricityReductionFactor !== undefined) {
    modified.monthlyElectricityKwh =
      original.monthlyElectricityKwh * (1 - params.electricityReductionFactor);
  }

  if (params.shoppingReductionFactor !== undefined) {
    modified.clothingItemsPerYear = Math.round(
      original.clothingItemsPerYear * (1 - params.shoppingReductionFactor)
    );
    modified.electronicsItemsPerYear = Math.round(
      original.electronicsItemsPerYear * (1 - params.shoppingReductionFactor)
    );
  }

  return modified;
}

/**
 * Run multiple simulations and return ranked results
 * @param {Object} assessmentData
 * @param {Array} scenarios
 * @returns {Array} sorted simulation results
 */
export function runMultipleSimulations(assessmentData, scenarios) {
  const results = scenarios.map(({ name, params }) => runSimulation(assessmentData, params, name));
  return results.sort((a, b) => b.annualSavingsKg - a.annualSavingsKg);
}
