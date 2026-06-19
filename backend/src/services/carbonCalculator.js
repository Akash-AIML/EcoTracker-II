/**
 * Carbon Calculator Service
 * Implements real-world emission factors from IPCC, EPA, and UK BEIS 2023
 */

// === Emission Factors ===
const EMISSION_FACTORS = {
  car: {
    petrol: 0.21, // kg CO₂ per km
    diesel: 0.17,
    electric: 0.047,
    hybrid: 0.105,
    none: 0,
  },
  publicTransport: 0.089, // kg CO₂ per km (bus average)
  train: 0.041, // kg CO₂ per km
  electricity: 0.233, // kg CO₂ per kWh (UK grid 2023)
  food: {
    vegan: 1500, // kg CO₂ per year
    vegetarian: 1700,
    mixed: 2500,
    heavy_meat: 3300,
  },
  clothing: 33, // kg CO₂ per clothing item (manufacturing + transport)
  electronics: 300, // kg CO₂ per device (avg smartphone/laptop lifecycle)
  flight: {
    short_haul: 255, // kg CO₂ per return flight (< 3 hours, incl. radiative forcing)
    long_haul: 1620, // kg CO₂ per return flight (> 3 hours)
  },
};

/**
 * Calculate transport-related CO₂ emissions
 * @param {Object} data
 * @returns {number} kg CO₂ per year
 */
export function calculateTransportEmission(data) {
  const {
    dailyCarKm = 0,
    carFuelType = 'none',
    publicTransportKmPerWeek = 0,
    cyclingKmPerWeek: _cyclingKmPerWeek = 0,
    shortFlightsPerYear = 0,
    longFlightsPerYear = 0,
  } = data;

  const carFactor = EMISSION_FACTORS.car[carFuelType] ?? 0;
  const carEmission = dailyCarKm * carFactor * 365;
  const publicTransportEmission = publicTransportKmPerWeek * 52 * EMISSION_FACTORS.publicTransport;
  const flightEmission =
    shortFlightsPerYear * EMISSION_FACTORS.flight.short_haul +
    longFlightsPerYear * EMISSION_FACTORS.flight.long_haul;
  // Cycling produces 0 direct emissions

  return carEmission + publicTransportEmission + flightEmission;
}

/**
 * Calculate home energy CO₂ emissions
 * @param {Object} data
 * @returns {number} kg CO₂ per year
 */
export function calculateEnergyEmission(data) {
  const { monthlyElectricityKwh = 0, renewablePercentage = 0 } = data;
  const nonRenewableFraction = 1 - Math.min(renewablePercentage, 100) / 100;
  return monthlyElectricityKwh * 12 * EMISSION_FACTORS.electricity * nonRenewableFraction;
}

/**
 * Calculate food & diet CO₂ emissions
 * @param {Object} data
 * @returns {number} kg CO₂ per year
 */
export function calculateFoodEmission(data) {
  const { dietType = 'mixed' } = data;
  return EMISSION_FACTORS.food[dietType] ?? EMISSION_FACTORS.food.mixed;
}

/**
 * Calculate shopping CO₂ emissions
 * @param {Object} data
 * @returns {number} kg CO₂ per year
 */
export function calculateShoppingEmission(data) {
  const { clothingItemsPerYear = 0, electronicsItemsPerYear = 0 } = data;
  return (
    clothingItemsPerYear * EMISSION_FACTORS.clothing +
    electronicsItemsPerYear * EMISSION_FACTORS.electronics
  );
}

/**
 * Calculate all emissions and return a full breakdown
 * @param {Object} inputData
 * @returns {Object} complete emission breakdown
 */
export function calculateAllEmissions(inputData) {
  const transport = calculateTransportEmission(inputData);
  const energy = calculateEnergyEmission(inputData);
  const food = calculateFoodEmission(inputData);
  const shopping = calculateShoppingEmission(inputData);
  const total = transport + energy + food + shopping;

  const safeTotal = total === 0 ? 1 : total;

  return {
    transportEmission: Math.round(transport),
    energyEmission: Math.round(energy),
    foodEmission: Math.round(food),
    shoppingEmission: Math.round(shopping),
    totalEmission: Math.round(total),
    breakdown: {
      transport: parseFloat(((transport / safeTotal) * 100).toFixed(1)),
      energy: parseFloat(((energy / safeTotal) * 100).toFixed(1)),
      food: parseFloat(((food / safeTotal) * 100).toFixed(1)),
      shopping: parseFloat(((shopping / safeTotal) * 100).toFixed(1)),
    },
  };
}

export { EMISSION_FACTORS };
