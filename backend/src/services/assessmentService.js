import db from '../utils/firebaseClient.js';
import { calculateAllEmissions } from './carbonCalculator.js';
import { calculateScore } from './scoringService.js';
import { generateRecommendations } from './recommendationEngine.js';
import crypto from 'crypto';

function computeStreak(userProfile) {
  const today = new Date().toISOString().split('T')[0];
  const streak = userProfile.streak || { current: 0, longest: 0, lastSaved: null };

  if (streak.lastSaved === today) {
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];

  const newCurrent = streak.lastSaved === yStr ? streak.current + 1 : 1;
  return {
    current: newCurrent,
    longest: Math.max(newCurrent, streak.longest || 0),
    lastSaved: today,
  };
}

function computeTitle(points) {
  if (points >= 25000) return 'Master Guardian';
  if (points >= 15000) return 'Climate Champion';
  if (points >= 10000) return 'Ocean Guardian';
  if (points >= 6000) return 'Nature Enthusiast';
  if (points >= 3000) return 'Carbon Reducer';
  if (points >= 1000) return 'Green Sprout';
  return 'Eco Novice';
}

function computeBadges(data, existingBadges = []) {
  const badges = new Set(existingBadges);
  if (data.dietType === 'vegan' || data.dietType === 'vegetarian') {
    badges.add('Tree Planter');
  }
  if (data.dailyCarKm === 0 || ['electric', 'hybrid', 'none'].includes(data.carFuelType)) {
    badges.add('Carbon Ninja');
  }
  if (data.clothingItemsPerYear < 5 && data.electronicsItemsPerYear === 0) {
    badges.add('Zero Waste');
  }
  return Array.from(badges);
}

/**
 * Create a new assessment with full emission analysis and recommendations.
 *
 * @param {Object} data - Validated assessment input (matches assessmentSchema).
 * @returns {Promise<{assessment: Object, emissions: Object, score: number}>}
 */
export async function createAssessmentWithRecommendations(data) {
  // ── Step 1: Resolve user ───────────────────────────────────────────────────
  const userDoc = await db.collection('users').doc(data.userId).get();
  let effectiveUserId = data.userId;
  let user = userDoc.exists ? userDoc.data() : null;

  if (!user) {
    const email = `${data.userId}@ecoguide.ai`;
    const qSnapshot = await db.collection('users').where('email', '==', email).get();

    if (!qSnapshot.empty) {
      const existingUserDoc = qSnapshot.docs[0];
      effectiveUserId = existingUserDoc.id;
      user = existingUserDoc.data();
    } else {
      const newUserId = data.userId;
      user = {
        id: newUserId,
        name: 'Anonymous',
        email: email,
        points: 0,
        badges: [],
        title: 'Eco Novice',
        streak: { current: 0, longest: 0, lastSaved: null },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.collection('users').doc(newUserId).set(user);
      effectiveUserId = newUserId;
    }
  }

  // ── Step 2: Calculate emissions ────────────────────────────────────────────
  const emissions = calculateAllEmissions(data);

  // ── Step 3: Score ──────────────────────────────────────────────────────────
  const score = calculateScore(emissions.totalEmission);

  // ── Step 4: Generate personalised recommendations ──────────────────────────
  const recs = generateRecommendations(data, emissions);

  // ── Step 5: Update User Profile (Points, Streak, Badges, Title) ────────────
  const currentStreak = computeStreak(user);
  const isStreakMilestone = currentStreak.current > 0;
  const streakBonus =
    isStreakMilestone && currentStreak.current % 7 === 0
      ? 250
      : isStreakMilestone && currentStreak.current % 3 === 0
        ? 50
        : 0;

  const awardedPoints = 100 + streakBonus;
  const newPoints = (user.points || 0) + awardedPoints;
  const newBadges = computeBadges(data, user.badges || []);
  const newTitle = computeTitle(newPoints);

  const updatedUser = {
    ...user,
    points: newPoints,
    badges: newBadges,
    title: newTitle,
    streak: currentStreak,
    updatedAt: new Date().toISOString(),
  };

  await db.collection('users').doc(effectiveUserId).set(updatedUser);

  // ── Step 6: Persist Assessment ─────────────────────────────────────────────
  const assessmentId = crypto.randomUUID();
  const assessmentDocData = {
    id: assessmentId,
    userId: effectiveUserId,
    dailyCarKm: data.dailyCarKm,
    carFuelType: data.carFuelType,
    publicTransportKmPerWeek: data.publicTransportKmPerWeek,
    cyclingKmPerWeek: data.cyclingKmPerWeek,
    shortFlightsPerYear: data.shortFlightsPerYear,
    longFlightsPerYear: data.longFlightsPerYear,
    monthlyElectricityKwh: data.monthlyElectricityKwh,
    renewablePercentage: data.renewablePercentage,
    dietType: data.dietType,
    clothingItemsPerYear: data.clothingItemsPerYear,
    electronicsItemsPerYear: data.electronicsItemsPerYear,
    transportEmission: emissions.transportEmission,
    energyEmission: emissions.energyEmission,
    foodEmission: emissions.foodEmission,
    shoppingEmission: emissions.shoppingEmission,
    totalEmission: emissions.totalEmission,
    sustainabilityScore: score,
    createdAt: new Date().toISOString(),
  };

  await db.collection('assessments').doc(assessmentId).set(assessmentDocData);

  const recommendationsList = [];
  for (const r of recs) {
    const recId = crypto.randomUUID();
    const recDocData = {
      id: recId,
      assessmentId,
      title: r.title,
      description: r.description,
      estimatedSavings: r.estimatedSavings,
      priority: r.priority,
      category: r.category,
      createdAt: new Date().toISOString(),
    };
    await db.collection('recommendations').doc(recId).set(recDocData);
    recommendationsList.push(recDocData);
  }

  recommendationsList.sort((a, b) => (b.estimatedSavings || 0) - (a.estimatedSavings || 0));

  const assessment = {
    ...assessmentDocData,
    recommendations: recommendationsList,
  };

  return { assessment, emissions, score };
}
