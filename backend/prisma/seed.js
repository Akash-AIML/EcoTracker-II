import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  { name: 'Alice Green', email: 'alice@ecoguide.ai' },
  { name: 'Bob Carbon', email: 'bob@ecoguide.ai' },
  { name: 'Carol Earth', email: 'carol@ecoguide.ai' },
];

const assessmentTemplates = [
  {
    // Low carbon user
    dailyCarKm: 0,
    carFuelType: 'none',
    publicTransportKmPerWeek: 60,
    cyclingKmPerWeek: 40,
    shortFlightsPerYear: 0,
    longFlightsPerYear: 0,
    monthlyElectricityKwh: 120,
    renewablePercentage: 80,
    dietType: 'vegan',
    clothingItemsPerYear: 5,
    electronicsItemsPerYear: 0,
  },
  {
    // Average user
    dailyCarKm: 20,
    carFuelType: 'petrol',
    publicTransportKmPerWeek: 20,
    cyclingKmPerWeek: 10,
    shortFlightsPerYear: 2,
    longFlightsPerYear: 1,
    monthlyElectricityKwh: 250,
    renewablePercentage: 10,
    dietType: 'mixed',
    clothingItemsPerYear: 12,
    electronicsItemsPerYear: 1,
  },
  {
    // High carbon user
    dailyCarKm: 50,
    carFuelType: 'petrol',
    publicTransportKmPerWeek: 0,
    cyclingKmPerWeek: 0,
    shortFlightsPerYear: 6,
    longFlightsPerYear: 3,
    monthlyElectricityKwh: 500,
    renewablePercentage: 0,
    dietType: 'heavy_meat',
    clothingItemsPerYear: 40,
    electronicsItemsPerYear: 4,
  },
];

// Calculate emissions inline for seeding
function calcTransport(d) {
  const carFactors = { petrol: 0.21, diesel: 0.17, electric: 0.047, hybrid: 0.105, none: 0 };
  const car = d.dailyCarKm * (carFactors[d.carFuelType] ?? 0) * 365;
  const pt = d.publicTransportKmPerWeek * 52 * 0.089;
  const flights = d.shortFlightsPerYear * 255 + d.longFlightsPerYear * 1620;
  return Math.round(car + pt + flights);
}

function calcEnergy(d) {
  return Math.round(d.monthlyElectricityKwh * 12 * 0.233 * (1 - d.renewablePercentage / 100));
}

function calcFood(d) {
  return { vegan: 1500, vegetarian: 1700, mixed: 2500, heavy_meat: 3300 }[d.dietType];
}

function calcShopping(d) {
  return Math.round(d.clothingItemsPerYear * 33 + d.electronicsItemsPerYear * 300);
}

function calcScore(total) {
  if (total <= 2000) return 100;
  if (total >= 12000) return 0;
  if (total <= 3000) return Math.round(90 + ((3000 - total) / 1000) * 10);
  if (total <= 5000) return Math.round(70 + ((5000 - total) / 2000) * 20);
  if (total <= 7500) return Math.round(50 + ((7500 - total) / 2500) * 20);
  return Math.round(((12000 - total) / 4500) * 50);
}

async function seed() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.simulation.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.user.deleteMany({ where: { email: { in: users.map((u) => u.email) } } });

  for (let i = 0; i < users.length; i++) {
    const user = await prisma.user.create({ data: users[i] });
    console.log(`✅ Created user: ${user.name}`);

    // Create 2 assessments per user (at different dates)
    for (let j = 0; j < 2; j++) {
      const template = assessmentTemplates[i];
      // Slightly vary the second assessment to simulate improvement
      const assessData =
        j === 0
          ? template
          : {
              ...template,
              dailyCarKm: Math.max(0, template.dailyCarKm - 5),
              monthlyElectricityKwh: Math.max(0, template.monthlyElectricityKwh - 20),
            };

      const transport = calcTransport(assessData);
      const energy = calcEnergy(assessData);
      const food = calcFood(assessData);
      const shopping = calcShopping(assessData);
      const total = transport + energy + food + shopping;
      const score = calcScore(total);

      await prisma.assessment.create({
        data: {
          userId: user.id,
          ...assessData,
          transportEmission: transport,
          energyEmission: energy,
          foodEmission: food,
          shoppingEmission: shopping,
          totalEmission: total,
          sustainabilityScore: score,
          createdAt: new Date(Date.now() - (j === 0 ? 30 : 0) * 24 * 60 * 60 * 1000),
          recommendations: {
            create: [
              {
                title: 'Example: Switch to Renewable Energy',
                description:
                  'Sign up for a green energy tariff to reduce electricity emissions significantly.',
                estimatedSavings: Math.round(energy * 0.7),
                priority: 'HIGH',
                category: 'energy',
              },
              {
                title: 'Example: Reduce Meat Consumption',
                description: 'Cutting red meat 3 days per week can save hundreds of kg CO₂/year.',
                estimatedSavings: 500,
                priority: 'MEDIUM',
                category: 'food',
              },
            ],
          },
        },
      });
    }
    console.log(`  ✅ Created assessments for ${user.name}`);
  }

  const count = await prisma.user.count();
  const assessCount = await prisma.assessment.count();
  console.log(`\n🎉 Seed complete! ${count} users, ${assessCount} assessments created.`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
