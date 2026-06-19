/**
 * AI Recommendation Engine
 * Analyzes user assessment data and generates personalized, prioritized recommendations
 * using decision-tree logic based on real emission factors
 */

import { EMISSION_FACTORS } from './carbonCalculator.js';

const PRIORITY = { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };

/**
 * Generate personalized recommendations from assessment data and calculated emissions
 * @param {Object} assessmentData - user input data
 * @param {Object} emissions - calculated emission breakdown
 * @returns {Array} sorted array of recommendation objects
 */
export function generateRecommendations(assessmentData, emissions) {
  const recommendations = [];

  // === TRANSPORTATION RECOMMENDATIONS ===
  _analyzeTransport(assessmentData, emissions, recommendations);

  // === ENERGY RECOMMENDATIONS ===
  _analyzeEnergy(assessmentData, emissions, recommendations);

  // === FOOD RECOMMENDATIONS ===
  _analyzeFood(assessmentData, emissions, recommendations);

  // === SHOPPING RECOMMENDATIONS ===
  _analyzeShopping(assessmentData, emissions, recommendations);

  // Sort: HIGH priority first, then by estimated savings descending
  return recommendations.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.estimatedSavings - a.estimatedSavings;
  });
}

function _analyzeTransport(data, emissions, recs) {
  const {
    dailyCarKm = 0,
    carFuelType = 'none',
    publicTransportKmPerWeek = 0,
    shortFlightsPerYear = 0,
    longFlightsPerYear = 0,
    cyclingKmPerWeek: _cyclingKmPerWeek = 0,
  } = data;

  const totalFlights = shortFlightsPerYear + longFlightsPerYear;
  const flightEmission =
    shortFlightsPerYear * EMISSION_FACTORS.flight.short_haul +
    longFlightsPerYear * EMISSION_FACTORS.flight.long_haul;

  // 1. EV switch recommendation
  if (dailyCarKm > 10 && carFuelType === 'petrol') {
    const currentCarEmission = dailyCarKm * EMISSION_FACTORS.car.petrol * 365;
    const evCarEmission = dailyCarKm * EMISSION_FACTORS.car.electric * 365;
    const savings = Math.round(currentCarEmission - evCarEmission);
    recs.push({
      title: 'Switch to an Electric Vehicle',
      description: `You drive ${dailyCarKm}km daily on petrol, generating ~${Math.round(currentCarEmission)}kg CO₂/year. An EV running on grid electricity would cut this by ~75%, saving ${savings}kg annually.`,
      estimatedSavings: savings,
      priority: savings > 1500 ? PRIORITY.HIGH : PRIORITY.MEDIUM,
      category: 'transport',
    });
  }

  if (dailyCarKm > 10 && carFuelType === 'diesel') {
    const currentCarEmission = dailyCarKm * EMISSION_FACTORS.car.diesel * 365;
    const evCarEmission = dailyCarKm * EMISSION_FACTORS.car.electric * 365;
    const savings = Math.round(currentCarEmission - evCarEmission);
    recs.push({
      title: 'Switch to an Electric Vehicle',
      description: `Your diesel vehicle contributes ~${Math.round(currentCarEmission)}kg CO₂/year. Switching to an EV could save ${savings}kg annually and reduce urban air pollution.`,
      estimatedSavings: savings,
      priority: savings > 1200 ? PRIORITY.HIGH : PRIORITY.MEDIUM,
      category: 'transport',
    });
  }

  // 2. Cycling recommendation
  if (dailyCarKm > 3 && carFuelType !== 'none') {
    const carFactor = EMISSION_FACTORS.car[carFuelType] ?? 0.21;
    // Assume 30% of short trips could be cycled
    const cyclableKmPerDay = Math.min(dailyCarKm * 0.3, 5);
    const savings = Math.round(cyclableKmPerDay * carFactor * 365);
    recs.push({
      title: 'Replace Short Trips with Cycling or Walking',
      description: `Cycling or walking for journeys under 5km instead of driving could save ~${savings}kg CO₂/year while improving your health and reducing congestion.`,
      estimatedSavings: savings,
      priority: PRIORITY.MEDIUM,
      category: 'transport',
    });
  }

  // 3. Public transport recommendation
  if (dailyCarKm > 15 && publicTransportKmPerWeek < 20 && carFuelType !== 'electric') {
    const carFactor = EMISSION_FACTORS.car[carFuelType] ?? 0.21;
    const potentialPTKm = dailyCarKm * 5; // weekday trips
    const savings = Math.round(potentialPTKm * 52 * (carFactor - EMISSION_FACTORS.publicTransport));
    recs.push({
      title: 'Use Public Transport for Commuting',
      description: `Switching even 2 days/week to public transport for your ${dailyCarKm}km daily commute could save ~${savings}kg CO₂/year and reduce traffic stress.`,
      estimatedSavings: Math.max(0, savings),
      priority: savings > 800 ? PRIORITY.HIGH : PRIORITY.MEDIUM,
      category: 'transport',
    });
  }

  // 4. Flight reduction
  if (totalFlights >= 2) {
    const savings = Math.round(flightEmission * 0.5);
    recs.push({
      title: 'Reduce Air Travel by 50%',
      description: `Your ${totalFlights} annual flight${totalFlights > 1 ? 's' : ''} contribute ~${Math.round(flightEmission)}kg CO₂. Cutting flights in half through video calls, trains, or choosing fewer trips saves ${savings}kg annually.`,
      estimatedSavings: savings,
      priority: flightEmission > 2000 ? PRIORITY.HIGH : PRIORITY.MEDIUM,
      category: 'transport',
    });
  }

  if (longFlightsPerYear >= 1) {
    recs.push({
      title: 'Choose Train Over Short-Haul Flights',
      description: `A long-haul flight emits ~1,620kg CO₂. For routes under 800km, trains emit 75–90% less CO₂ and are often as fast door-to-door.`,
      estimatedSavings: Math.round(longFlightsPerYear * 1620 * 0.85),
      priority: PRIORITY.HIGH,
      category: 'transport',
    });
  }

  // 5. Carpool suggestion
  if (dailyCarKm > 20 && publicTransportKmPerWeek < 10 && carFuelType !== 'electric') {
    const carFactor = EMISSION_FACTORS.car[carFuelType] ?? 0.21;
    const savings = Math.round(dailyCarKm * carFactor * 365 * 0.35);
    recs.push({
      title: 'Start Carpooling',
      description: `Sharing your commute with just one other person halves both your per-person emissions and fuel costs, saving an estimated ${savings}kg CO₂/year.`,
      estimatedSavings: savings,
      priority: PRIORITY.LOW,
      category: 'transport',
    });
  }
}

function _analyzeEnergy(data, emissions, recs) {
  const { monthlyElectricityKwh = 0, renewablePercentage = 0 } = data;
  const annualKwh = monthlyElectricityKwh * 12;

  // 1. Renewable energy tariff
  if (renewablePercentage < 50 && monthlyElectricityKwh > 100) {
    const currentEmission = annualKwh * 0.233 * (1 - renewablePercentage / 100);
    const renewableEmission = annualKwh * 0.233 * 0.1;
    const savings = Math.round(currentEmission - renewableEmission);
    recs.push({
      title: 'Switch to a 100% Renewable Energy Tariff',
      description: `Only ${renewablePercentage}% of your electricity comes from renewables. Switching to a green tariff costs little to nothing extra but can save ~${savings}kg CO₂/year immediately.`,
      estimatedSavings: savings,
      priority: savings > 600 ? PRIORITY.HIGH : PRIORITY.MEDIUM,
      category: 'energy',
    });
  }

  // 2. Solar panels
  if (renewablePercentage < 30 && monthlyElectricityKwh > 200) {
    const savings = Math.round(emissions.energyEmission * 0.7);
    recs.push({
      title: 'Install Solar Panels',
      description: `With your electricity consumption of ${monthlyElectricityKwh}kWh/month, rooftop solar panels could generate 70-80% of your electricity needs and save ~${savings}kg CO₂/year.`,
      estimatedSavings: savings,
      priority: PRIORITY.HIGH,
      category: 'energy',
    });
  }

  // 3. Reduce consumption
  if (monthlyElectricityKwh > 300) {
    const savings = Math.round(
      monthlyElectricityKwh * 0.25 * 12 * 0.233 * (1 - renewablePercentage / 100)
    );
    recs.push({
      title: 'Reduce Home Electricity Consumption',
      description: `Your usage of ${monthlyElectricityKwh}kWh/month is above average. Upgrading to LED lighting, smart thermostats, and A-rated appliances can reduce consumption by 20-30%, saving ~${savings}kg CO₂/year.`,
      estimatedSavings: Math.max(0, savings),
      priority: PRIORITY.MEDIUM,
      category: 'energy',
    });
  }

  // 4. Smart heating
  if (monthlyElectricityKwh > 150) {
    recs.push({
      title: 'Install a Smart Thermostat',
      description:
        'Smart thermostats learn your schedule and can reduce heating and cooling energy use by 10-15%, with typical savings of 150-400kg CO₂/year depending on home size.',
      estimatedSavings: Math.round(emissions.energyEmission * 0.12),
      priority: PRIORITY.LOW,
      category: 'energy',
    });
  }
}

function _analyzeFood(data, emissions, recs) {
  const { dietType = 'mixed' } = data;

  if (dietType === 'heavy_meat') {
    recs.push({
      title: 'Reduce Red Meat Consumption',
      description:
        'A heavy meat diet generates ~3,300kg CO₂/year from food alone. Cutting beef and lamb to twice a week while keeping other meat saves ~800kg CO₂/year — one of the highest-impact individual changes.',
      estimatedSavings: 800,
      priority: PRIORITY.HIGH,
      category: 'food',
    });
    recs.push({
      title: 'Try Meat-Free Mondays',
      description:
        'Going vegetarian just one day per week saves ~150kg CO₂/year. Extending to 3 meat-free days reduces your diet footprint by over 600kg annually.',
      estimatedSavings: 500,
      priority: PRIORITY.MEDIUM,
      category: 'food',
    });
  }

  if (dietType === 'mixed') {
    recs.push({
      title: 'Adopt a Vegetarian Diet',
      description:
        'Switching from a mixed to vegetarian diet saves ~800kg CO₂/year. Plant proteins like beans, lentils and tofu have 10-20x lower carbon footprints than beef.',
      estimatedSavings: 800,
      priority: PRIORITY.MEDIUM,
      category: 'food',
    });
  }

  if (dietType !== 'vegan') {
    recs.push({
      title: 'Reduce Food Waste',
      description:
        'Around 30% of food is wasted globally. Meal planning, proper storage and composting can reduce your food footprint by 10-15%, saving ~150-300kg CO₂/year.',
      estimatedSavings: Math.round(EMISSION_FACTORS.food[dietType] * 0.12),
      priority: PRIORITY.LOW,
      category: 'food',
    });

    recs.push({
      title: 'Choose Local & Seasonal Produce',
      description:
        'Out-of-season produce shipped by air can have 50x higher emissions than local seasonal equivalents. Shopping at farmers markets and choosing seasonal food reduces transport emissions.',
      estimatedSavings: Math.round(EMISSION_FACTORS.food[dietType] * 0.08),
      priority: PRIORITY.LOW,
      category: 'food',
    });
  }
}

function _analyzeShopping(data, emissions, recs) {
  const { clothingItemsPerYear = 0, electronicsItemsPerYear = 0 } = data;

  if (clothingItemsPerYear > 10) {
    const savings = Math.round(clothingItemsPerYear * EMISSION_FACTORS.clothing * 0.6);
    recs.push({
      title: 'Buy Second-Hand Clothing',
      description: `You buy ~${clothingItemsPerYear} clothing items per year. Sourcing 60% from charity shops, vintage stores or clothing swaps saves ~${savings}kg CO₂/year while reducing textile waste.`,
      estimatedSavings: savings,
      priority: clothingItemsPerYear > 20 ? PRIORITY.MEDIUM : PRIORITY.LOW,
      category: 'shopping',
    });
  }

  if (electronicsItemsPerYear >= 2) {
    const savings = Math.round(electronicsItemsPerYear * EMISSION_FACTORS.electronics * 0.5);
    recs.push({
      title: 'Repair & Extend Electronics Lifespan',
      description: `Manufacturing ${electronicsItemsPerYear} devices/year contributes ~${electronicsItemsPerYear * EMISSION_FACTORS.electronics}kg CO₂. Repairing devices and buying refurbished saves ~${savings}kg CO₂/year and significant money.`,
      estimatedSavings: savings,
      priority: PRIORITY.MEDIUM,
      category: 'shopping',
    });
  }

  if (clothingItemsPerYear > 5 || electronicsItemsPerYear >= 1) {
    recs.push({
      title: 'Choose Products with Lower Carbon Footprints',
      description:
        'Look for products with eco-certifications, made from recycled materials, or manufactured locally. Even small changes in purchasing habits compound over time.',
      estimatedSavings: Math.round(emissions.shoppingEmission * 0.15),
      priority: PRIORITY.LOW,
      category: 'shopping',
    });
  }
}
