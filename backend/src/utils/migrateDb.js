/* eslint-disable no-console */
import 'dotenv/config';
import db from './firebaseClient.js';
import crypto from 'crypto';

async function runMigration() {
  console.log('🏁 Starting migration from Carbon Version 1 to Version 2 structure...');
  try {
    const usersSnap = await db.collection('users').get();
    let migratedAssessmentsCount = 0;

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      console.log(`Processing user: ${userId}`);

      const historySnap = await db.collection('users').doc(userId).collection('history').get();

      for (const historyDoc of historySnap.docs) {
        const hData = historyDoc.data();
        const month = hData.month || historyDoc.id;
        const amount = hData.amount || 0;
        const breakdown = hData.breakdown || {};
        const timestamp = hData.timestamp || new Date().toISOString();

        // Check if already migrated
        const existingSnap = await db
          .collection('assessments')
          .where('userId', '==', userId)
          .where('createdAt', '==', timestamp)
          .get();

        if (!existingSnap.empty) {
          console.log(`  Assessment for ${userId} at ${timestamp} already migrated. Skipping.`);
          continue;
        }

        const assessmentId = crypto.randomUUID();
        const assessmentData = {
          id: assessmentId,
          userId: userId,
          dailyCarKm: 0,
          carFuelType: 'none',
          publicTransportKmPerWeek: 0,
          cyclingKmPerWeek: 0,
          shortFlightsPerYear: 0,
          longFlightsPerYear: 0,
          monthlyElectricityKwh: 0,
          renewablePercentage: 0,
          dietType: 'mixed',
          clothingItemsPerYear: 0,
          electronicsItemsPerYear: 0,
          transportEmission: breakdown.transport || 0,
          energyEmission: breakdown.electricity || 0,
          foodEmission: (breakdown.food || 0) + (breakdown.waste || 0),
          shoppingEmission: breakdown.shopping || 0,
          totalEmission: amount,
          sustainabilityScore: 80,
          createdAt: timestamp,
        };

        await db.collection('assessments').doc(assessmentId).set(assessmentData);
        migratedAssessmentsCount++;
        console.log(`  Migrated history ${month} (${amount} kg) to assessment ${assessmentId}`);
      }
    }

    console.log(
      `🎉 Migration complete! Migrated ${migratedAssessmentsCount} records to the new top-level assessments collection.`
    );
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

runMigration();
