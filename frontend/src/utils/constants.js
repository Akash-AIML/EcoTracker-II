/**
 * Carbon Emission Factors (kg CO₂e per unit)
 * Sources: IPCC, EPA, UK BEIS carbon factors 2023
 */

// Transportation emission factors
export const CAR_EMISSION_FACTORS = {
  petrol: 0.21, // kg CO₂ per km
  diesel: 0.17,
  electric: 0.047,
  hybrid: 0.105,
  none: 0,
};

export const PUBLIC_TRANSPORT_FACTOR = 0.089; // kg CO₂ per km (bus average)
export const TRAIN_FACTOR = 0.041; // kg CO₂ per km

export const FLIGHT_FACTORS = {
  short_haul: 255, // kg CO₂ per return flight (< 3h)
  long_haul: 1620, // kg CO₂ per return flight (> 3h)
};

// Energy emission factors
export const ELECTRICITY_GRID_FACTOR = 0.233; // kg CO₂ per kWh (UK grid 2023)

// Food emission factors (kg CO₂ per year)
export const FOOD_EMISSION_FACTORS = {
  vegan: 1500,
  vegetarian: 1700,
  mixed: 2500,
  heavy_meat: 3300,
};

// Shopping emission factors (kg CO₂ per item)
export const CLOTHING_FACTOR = 33; // per clothing item (average)
export const ELECTRONICS_FACTOR = 300; // per device (avg smartphone/laptop)

// Scoring thresholds
export const SCORE_THRESHOLDS = {
  excellent: { min: 90, max: 100, label: 'Excellent', color: '#10b981' },
  good: { min: 70, max: 89, label: 'Good', color: '#06b6d4' },
  moderate: { min: 50, max: 69, label: 'Moderate', color: '#f59e0b' },
  poor: { min: 0, max: 49, label: 'Needs Improvement', color: '#ef4444' },
};

// World averages (kg CO₂ per year)
export const GLOBAL_AVERAGE_EMISSION = 4700;
export const UK_AVERAGE_EMISSION = 5500;
export const TARGET_EMISSION = 2000; // Paris Agreement target per person

// Emission category labels
export const CATEGORY_LABELS = {
  transport: 'Transportation',
  energy: 'Home Energy',
  food: 'Food & Diet',
  shopping: 'Shopping',
};

// Emission category colors
export const CATEGORY_COLORS = {
  transport: '#34d399',
  energy: '#60a5fa',
  food: '#f472b6',
  shopping: '#fb923c',
};

// Fuel type labels
export const FUEL_TYPE_LABELS = {
  petrol: 'Petrol/Gasoline',
  diesel: 'Diesel',
  electric: 'Electric',
  hybrid: 'Hybrid',
  none: 'No Car',
};

// Diet type labels
export const DIET_TYPE_LABELS = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  mixed: 'Mixed (Occasional Meat)',
  heavy_meat: 'Heavy Meat Consumer',
};

// Simulation scenarios
export const SIMULATION_SCENARIOS = [
  {
    id: 'ev_switch',
    name: 'Switch to Electric Vehicle',
    description: 'Replace current car with an EV',
    icon: '⚡',
    category: 'transport',
    params: { carFuelType: 'electric' },
  },
  {
    id: 'cycle_3days',
    name: 'Cycle 3 Days/Week',
    description: 'Replace 3 days of car trips with cycling',
    icon: '🚴',
    category: 'transport',
    params: { cyclingReductionFactor: 0.4 },
  },
  {
    id: 'reduce_flights_50',
    name: 'Reduce Flights by 50%',
    description: 'Cut air travel in half',
    icon: '✈️',
    category: 'transport',
    params: { flightReductionFactor: 0.5 },
  },
  {
    id: 'solar_panels',
    name: 'Install Solar Panels',
    description: 'Generate 80% of electricity from solar',
    icon: '☀️',
    category: 'energy',
    params: { renewablePercentage: 80 },
  },
  {
    id: 'vegetarian_diet',
    name: 'Switch to Vegetarian Diet',
    description: 'Replace meat with plant-based alternatives',
    icon: '🥗',
    category: 'food',
    params: { dietType: 'vegetarian' },
  },
  {
    id: 'vegan_diet',
    name: 'Switch to Vegan Diet',
    description: 'Fully plant-based lifestyle',
    icon: '🌱',
    category: 'food',
    params: { dietType: 'vegan' },
  },
  {
    id: 'reduce_electricity_30',
    name: 'Reduce Electricity by 30%',
    description: 'Energy efficiency improvements at home',
    icon: '💡',
    category: 'energy',
    params: { electricityReductionFactor: 0.3 },
  },
  {
    id: 'secondhand_shopping',
    name: 'Buy Second-Hand Only',
    description: 'Source 70% of purchases second-hand',
    icon: '♻️',
    category: 'shopping',
    params: { shoppingReductionFactor: 0.7 },
  },
];

// Privacy notice
export const PRIVACY_NOTICE =
  'EcoGuide AI does not collect personal data. All calculations use anonymous session IDs stored only in your browser. No names, emails, or identifying information are required or retained.';

// Input validation limits (mirroring backend Zod schema)
export const INPUT_LIMITS = {
  dailyCarKm: { min: 0, max: 1000 },
  publicTransportKmPerWeek: { min: 0, max: 10000 },
  cyclingKmPerWeek: { min: 0, max: 1000 },
  shortFlightsPerYear: { min: 0, max: 100 },
  longFlightsPerYear: { min: 0, max: 50 },
  monthlyElectricityKwh: { min: 0, max: 10000 },
  renewablePercentage: { min: 0, max: 100 },
  clothingItemsPerYear: { min: 0, max: 500 },
  electronicsItemsPerYear: { min: 0, max: 50 },
};
