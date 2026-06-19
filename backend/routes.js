const express = require('express');
const router = express.Router();
const db = require('./firebase');

// Simple in-memory cache for Firestore queries to optimize efficiency
let usersCache = null;
let usersCacheTime = 0;
const CACHE_TTL = 10000; // 10 seconds

/**
 * Retrieves all users from Firestore with a short-lived cache (10 seconds)
 * to optimize read efficiency and limit database requests.
 * @returns {Promise<Array<Object>>} A list of all user profiles.
 */
async function getAllUsersCached() {
  const now = Date.now();
  if (usersCache && (now - usersCacheTime < CACHE_TTL)) {
    return usersCache;
  }
  const snapshot = await db.collection('users').get();
  usersCache = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || doc.id,
      email: data.email || '',
      avatar: data.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R',
      points: data.points || 0,
      title: data.title || 'Eco Novice',
      percentages: data.percentages || { transport: 20, electricity: 20, food: 20, waste: 20, shopping: 20 },
      complianceRate: data.complianceRate || '80.0%',
      totalMonthly: data.totalMonthly || 0
    };
  });
  usersCacheTime = now;
  return usersCache;
}

// ==========================================
// Static Config Presets & Challenges Templates
// ==========================================
const staticConfig = {
  factors: {
    car: 0.16,
    bus: 0.08,
    bike: 0.005,
    walk: 0.0,
    train: 0.04,
    ev: 0.02,
  },
  multipliers: {
    electric: 0.3,
    hybrid: 0.6,
    gasoline: 1.0,
    diesel: 1.2,
    lpg: 0.8,
  }
};

const defaultChallenges = [
  {
    id: '1',
    title: 'No-Car Week',
    points: '+500 pts',
    pointsValue: 500,
    timeLeft: '4 days left',
    icon: 'directions-car',
    color: '#4edea3',
    bgColor: 'rgba(78, 222, 163, 0.15)',
    associatedBadge: 'Carbon Ninja',
  },
  {
    id: '2',
    title: 'Vegan Weekend',
    points: '+250 pts',
    pointsValue: 250,
    timeLeft: 'Starts in 12h',
    icon: 'eco',
    color: '#ffb95f',
    bgColor: 'rgba(255, 185, 95, 0.15)',
    associatedBadge: 'Tree Planter',
  },
  {
    id: '3',
    title: 'Plastic-Free',
    points: '+400 pts',
    pointsValue: 400,
    timeLeft: '2 days left',
    icon: 'shopping-bag',
    color: '#4edea3',
    bgColor: 'rgba(78, 222, 163, 0.15)',
    associatedBadge: 'Zero Waste',
  },
];

/**
 * Helper to retrieve the active user ID from request headers or query params
 * @param {express.Request} req - Express request object
 * @returns {string} active user ID
 */
function getRequestUserId(req) {
  return req.headers['x-user-id'] || req.query.userId || 'sarah_j';
}

// ==========================================
// API Endpoints (Firestore Powered)
// ==========================================

/**
 * GET /api/config
 * Retrieves carbon footprint factors and multipliers configuration presets.
 * @route GET /api/config
 * @returns {Object} 200 - Static config presets
 */
router.get('/config', (req, res) => {
  res.json(staticConfig);
});

/**
 * GET /api/profile
 * Retrieves profile information for the active user, creating a default one if not found.
 * @route GET /api/profile
 * @returns {Object} 200 - User profile data object
 * @returns {Object} 500 - Internal server error
 */
router.get('/profile', async (req, res, next) => {
  const userId = getRequestUserId(req);
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      res.json(userDoc.data());
    } else {
      // Create a new user template if not exists
      const defaultProfile = {
        email: `${userId}@example.com`,
        name: userId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R',
        title: 'Eco Novice',
        points: 0,
        badges: [],
        percentages: { transport: 20, electricity: 20, food: 20, waste: 20, shopping: 20 },
        complianceRate: '80.0%',
        totalMonthly: 0
      };
      await db.collection('users').doc(userId).set(defaultProfile);
      res.json(defaultProfile);
    }
  } catch (err) {
    next(err);
  }
});

let statsCache = null;
let statsCacheTime = 0;

/**
 * GET /api/stats
 * Retrieves global platform usage/sustainability metrics for the landing page.
 * Uses a short-lived cache (10 seconds).
 * @route GET /api/stats
 * @returns {Object} 200 - Global metrics payload
 */
router.get('/stats', async (req, res) => {
  const now = Date.now();
  if (statsCache && (now - statsCacheTime < 10000)) {
    return res.json(statsCache);
  }
  try {
    const users = await getAllUsersCached();
    const userCount = users.length;
    statsCache = {
      globalReduction: '-14.2%',
      globalSavedTons: '12 Tons',
      activeProjectCount: `${Math.max(userCount * 12 + 50000, 50000).toLocaleString()}+`,
      treesRestoredCount: `${Math.max(userCount, 8000).toLocaleString()}+`,
      aiPrecision: '99.9%',
    };
    statsCacheTime = now;
    res.json(statsCache);
  } catch (err) {
    res.json({
      globalReduction: '-14.2%',
      globalSavedTons: '12 Tons',
      activeProjectCount: '50,000+',
      treesRestoredCount: '8,000+',
      aiPrecision: '99.9%',
    });
  }
});

/**
 * GET /api/insights
 * Retrieves current footprint total, compliance rate, carbon share percentages, and AI recommendations.
 * @route GET /api/insights
 * @returns {Object} 200 - User insights payload
 * @returns {Object} 500 - Internal server error
 */
router.get('/insights', async (req, res, next) => {
  const userId = getRequestUserId(req);
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    const totalMonthly = userData.totalMonthly || 0;
    const percentages = userData.percentages || { transport: 20, electricity: 20, food: 20, waste: 20, shopping: 20 };
    
    res.json({
      totalMonthly: totalMonthly,
      complianceRate: userData.complianceRate || '90.0%',
      percentages: percentages,
      recommendations: await generateRecommendations(totalMonthly, percentages)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/carbon/calculate
 * Calculates carbon footprint based on transport, electricity, food, waste, and shopping habits.
 * @route POST /api/carbon/calculate
 * @param {Object} req.body - Footprint details
 * @returns {Object} 200 - Computation results with monthly/yearly emissions and category breakdowns
 * @returns {Object} 400 - Validation error payload
 */
router.post('/carbon/calculate', (req, res) => {
  const { transport, electricity, food, waste, shopping } = req.body;

  // Validate transport inputs if provided
  if (transport !== undefined) {
    if (typeof transport !== 'object' || transport === null) {
      return res.status(400).json({ error: 'Transport parameter must be an object' });
    }
    if (transport.distance !== undefined && (typeof transport.distance !== 'number' || transport.distance < 0 || isNaN(transport.distance))) {
      return res.status(400).json({ error: 'Transport distance must be a valid positive number' });
    }
    if (transport.daysPerWeek !== undefined && (typeof transport.daysPerWeek !== 'number' || transport.daysPerWeek < 0 || transport.daysPerWeek > 7 || isNaN(transport.daysPerWeek))) {
      return res.status(400).json({ error: 'Transport daysPerWeek must be a valid number between 0 and 7' });
    }
  }
  // Validate electricity inputs if provided
  if (electricity !== undefined) {
    if (typeof electricity !== 'object' || electricity === null) {
      return res.status(400).json({ error: 'Electricity parameter must be an object' });
    }
    if (electricity.units !== undefined && (typeof electricity.units !== 'number' || electricity.units < 0 || isNaN(electricity.units))) {
      return res.status(400).json({ error: 'Electricity units must be a valid positive number' });
    }
  }
  // Validate food inputs if provided
  if (food !== undefined && (typeof food !== 'object' || food === null)) {
    return res.status(400).json({ error: 'Food parameter must be an object' });
  }
  // Validate waste inputs if provided
  if (waste !== undefined && (typeof waste !== 'object' || waste === null)) {
    return res.status(400).json({ error: 'Waste parameter must be an object' });
  }
  // Validate shopping inputs if provided
  if (shopping !== undefined && (typeof shopping !== 'object' || shopping === null)) {
    return res.status(400).json({ error: 'Shopping parameter must be an object' });
  }

  // Compute Transport
  const tMode = transport?.mode || 'car';
  const tDist = transport?.distance || 0;
  const tFuel = transport?.fuelType || 'gasoline';
  const tDays = transport?.daysPerWeek || 5;

  let tFactor = staticConfig.factors[tMode] || 0;
  let tMultiplier = 1.0;
  if (tMode === 'car' || tMode === 'bus') {
    tMultiplier = staticConfig.multipliers[tFuel] || 1.0;
  }
  const transportMonthly = tFactor * tDist * tMultiplier * tDays * 4.3;

  // Compute Electricity (monthly kWh units)
  const eUnits = electricity?.units || 0;
  const electricityMonthly = eUnits * 0.85;

  // Compute Food
  const fType = food?.type || 'vegetarian';
  const fChicken = food?.chicken || 0;
  const fMutton = food?.mutton || 0;
  const fBeef = food?.beef || 0;
  const fFish = food?.fish || 0;

  let baseFood = 100;
  if (fType === 'vegan') baseFood = 60;
  if (fType === 'non-vegetarian') baseFood = 150;
  const foodMonthly = baseFood + (fChicken * 4) + (fMutton * 10) + (fBeef * 25) + (fFish * 3);

  // Compute Waste
  const wPlastic = waste?.plasticUsage || 5;
  const wRecycle = waste?.recyclingHabits || 'partial';
  const recycleOffset = wRecycle === 'none' ? 12 : wRecycle === 'partial' ? 6 : 0;
  const wasteMonthly = (wPlastic * 4) + recycleOffset;

  // Compute Shopping
  const sClothes = shopping?.clothes || 0;
  const sOrders = shopping?.onlineOrders || 0;
  const sElectronics = shopping?.electronics || 0;
  const shoppingMonthly = (sClothes * 10) + (sOrders * 2) + (sElectronics * 80);

  // Totals
  const monthlyEmission = transportMonthly + electricityMonthly + foodMonthly + wasteMonthly + shoppingMonthly;
  const yearlyEmission = monthlyEmission * 12;

  const breakdown = {
    transport: parseFloat(transportMonthly.toFixed(1)),
    electricity: parseFloat(electricityMonthly.toFixed(1)),
    food: parseFloat(foodMonthly.toFixed(1)),
    waste: parseFloat(wasteMonthly.toFixed(1)),
    shopping: parseFloat(shoppingMonthly.toFixed(1)),
  };

  res.json({
    monthlyEmission: parseFloat(monthlyEmission.toFixed(1)),
    yearlyEmission: parseFloat(yearlyEmission.toFixed(1)),
    breakdown
  });
});

/**
 * POST /api/footprint/save
 * Saves a footprint calculation to database history and updates user stats / points.
 * @route POST /api/footprint/save
 * @param {Object} req.body - Footprint computation values to store
 * @returns {Object} 200 - Saved status, updated history, and updated profile
 * @returns {Object} 400 - Validation error payload
 * @returns {Object} 500 - Internal server error
 */
router.post('/footprint/save', async (req, res, next) => {
  const userId = getRequestUserId(req);
  const { monthlyEmission, breakdown } = req.body;

  if (monthlyEmission === undefined || typeof monthlyEmission !== 'number' || monthlyEmission < 0 || isNaN(monthlyEmission)) {
    return res.status(400).json({ error: 'monthlyEmission must be a valid positive number' });
  }
  if (breakdown !== undefined && (typeof breakdown !== 'object' || breakdown === null)) {
    return res.status(400).json({ error: 'breakdown must be a valid object' });
  }

  try {
    const currentMonthName = 'Jun';
    
    // Save to subcollection history
    await db.collection('users').doc(userId).collection('history').doc(currentMonthName).set({
      month: currentMonthName,
      amount: Math.round(monthlyEmission)
    });

    // Update user profile summary in firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const profile = userDoc.exists ? userDoc.data() : {};

    let newPercentages = profile.percentages || { transport: 20, electricity: 20, food: 20, waste: 20, shopping: 20 };
    if (breakdown) {
      const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
      if (total > 0) {
        newPercentages = {
          transport: Math.round((breakdown.transport / total) * 100),
          electricity: Math.round((breakdown.electricity / total) * 100),
          food: Math.round((breakdown.food / total) * 100),
          waste: Math.round((breakdown.waste / total) * 100),
          shopping: Math.round((breakdown.shopping / total) * 100),
        };
      }
    }

    const updatedPoints = (profile.points || 0) + 100;
    const currentTitle = updatedPoints >= 12000 ? 'Master Guardian' : updatedPoints >= 11000 ? 'Nature Enthusiast' : 'Eco Novice';

    const updatedProfile = {
      ...profile,
      points: updatedPoints,
      title: currentTitle,
      totalMonthly: Math.round(monthlyEmission),
      percentages: newPercentages
    };

    await db.collection('users').doc(userId).set(updatedProfile);
    usersCache = null; // Invalidate cache

    // Fetch updated history list
    const snapshot = await db.collection('users').doc(userId).collection('history').get();
    const historyList = snapshot.docs.map(doc => doc.data());

    res.json({
      success: true,
      history: historyList,
      profile: updatedProfile
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/history
 * Retrieves the historical timeline of carbon calculation submissions.
 * @route GET /api/history
 * @returns {Array<Object>} 200 - Array of historical emission data points
 * @returns {Object} 500 - Internal server error
 */
router.get('/history', async (req, res, next) => {
  const userId = getRequestUserId(req);
  try {
    const snapshot = await db.collection('users').doc(userId).collection('history').get();
    const historyList = snapshot.docs.map(doc => doc.data());
    
    const monthOrder = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
    historyList.sort((a, b) => (monthOrder[a.month] || 0) - (monthOrder[b.month] || 0));

    // Seed default history data for Sarah J if database is fresh
    if (historyList.length === 0 && userId === 'sarah_j') {
      const defaultHistory = [
        { month: 'Jan', amount: 155 },
        { month: 'Feb', amount: 145 },
        { month: 'Mar', amount: 130 },
        { month: 'Apr', amount: 125 },
        { month: 'May', amount: 112 },
        { month: 'Jun', amount: 98 }
      ];
      // Save it asynchronously
      for (const record of defaultHistory) {
        await db.collection('users').doc(userId).collection('history').doc(record.month).set(record);
      }
      return res.json(defaultHistory);
    }

    res.json(historyList);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/goals
 * Retrieves active carbon reduction goals for the current user.
 * @route GET /api/goals
 * @returns {Array<Object>} 200 - List of active goals
 * @returns {Object} 500 - Internal server error
 */
router.get('/goals', async (req, res, next) => {
  const userId = getRequestUserId(req);
  try {
    const snapshot = await db.collection('users').doc(userId).collection('goals').get();
    const goalsList = snapshot.docs.map(doc => doc.data());

    // Seed default goals for Sarah J if database is fresh
    if (goalsList.length === 0 && userId === 'sarah_j') {
      const defaultGoals = [
        { id: '1', title: 'Reduce footprint by 20%', progress: 0.75, target: '20% Reduction' },
        { id: '2', title: 'Cycle 3 days/week', progress: 0.40, target: '3 Days/Week' }
      ];
      for (const goal of defaultGoals) {
        await db.collection('users').doc(userId).collection('goals').doc(goal.id).set(goal);
      }
      return res.json(defaultGoals);
    }

    res.json(goalsList);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/goals
 * Adds a new carbon reduction goal for the current user and awards 50 points.
 * @route POST /api/goals
 * @param {Object} req.body - Goal metadata (title, target)
 * @returns {Object} 200 - Goal creation success status, list of goals, and updated profile
 * @returns {Object} 400 - Validation error payload
 * @returns {Object} 500 - Internal server error
 */
router.post('/goals', async (req, res, next) => {
  const userId = getRequestUserId(req);
  const { title, target } = req.body;
  
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Goal title must be a valid non-empty string' });
  }
  if (title.length > 100) {
    return res.status(400).json({ error: 'Goal title must be under 100 characters' });
  }
  if (target !== undefined && (typeof target !== 'string' || target.length > 50)) {
    return res.status(400).json({ error: 'Goal target must be a valid string under 50 characters' });
  }

  const sanitizedTitle = title.replace(/<[^>]*>/g, '').trim();
  const sanitizedTarget = (target || '').replace(/<[^>]*>/g, '').trim();

  try {
    const snapshot = await db.collection('users').doc(userId).collection('goals').get();
    const newId = String(snapshot.docs.length + 1);

    const newGoal = {
      id: newId,
      title: sanitizedTitle,
      progress: 0.0,
      target: sanitizedTarget || 'Active Target'
    };

    await db.collection('users').doc(userId).collection('goals').doc(newId).set(newGoal);
    usersCache = null; // Invalidate cache

    // Reward profile points
    const userDoc = await db.collection('users').doc(userId).get();
    const profile = userDoc.exists ? userDoc.data() : { points: 0 };
    const updatedPoints = (profile.points || 0) + 50;
    const currentTitle = updatedPoints >= 12000 ? 'Master Guardian' : updatedPoints >= 11000 ? 'Nature Enthusiast' : 'Eco Novice';

    const updatedProfile = {
      ...profile,
      points: updatedPoints,
      title: currentTitle
    };
    await db.collection('users').doc(userId).set(updatedProfile);

    const updatedSnapshot = await db.collection('users').doc(userId).collection('goals').get();
    const goalsList = updatedSnapshot.docs.map(doc => doc.data());

    res.json({ success: true, goal: newGoal, goals: goalsList, profile: updatedProfile });
  } catch (err) {
    next(err);
  }
});

/**
 * Helper to generate AI sustainability recommendations using Groq's Llama model or static fallbacks.
 * @param {number} footprint - Monthly carbon footprint in kg CO2e
 * @param {Object} breakdown - Breakdown percentages per carbon category
 * @returns {Promise<Array<Object>>} A promise that resolves to exactly 3 recommendations
 */
async function generateRecommendations(footprint, breakdown) {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI Sustainability Coach. You analyze a user\'s carbon footprint (in kg CO2e) and category percentage breakdown (transport, electricity, food, waste, shopping). You must return exactly 3 highly actionable, personalized recommendations to help the user reduce their footprint. Return the recommendations as a JSON object containing a "recommendations" array. Each recommendation in the array must be an object with fields: "title" (under 40 characters), "desc" (1-2 sentences with concrete tips), "icon" (MaterialIcons icon name), and "color" (hex color code).'
            },
            {
              role: 'user',
              content: `Carbon Footprint: ${footprint} kg CO2e. Percentage breakdown: Transport: ${breakdown?.transport || 0}%, Electricity: ${breakdown?.electricity || 0}%, Food: ${breakdown?.food || 0}%, Waste: ${breakdown?.waste || 0}%, Shopping: ${breakdown?.shopping || 0}%.`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });
      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        if (content && Array.isArray(content.recommendations) && content.recommendations.length > 0) {
          return content.recommendations;
        }
      } else {
        console.error('Groq API responded with error:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Error fetching Groq recommendation:', err);
    }
  }

  // Fallback to static recommendations
  const transportPct = breakdown?.transport || 45;
  const electricityPct = breakdown?.electricity || 20;
  const foodPct = breakdown?.food || 20;

  const recs = [];

  if (transportPct >= 35) {
    recs.push({
      title: 'Transport contributes most emissions',
      desc: `Your transport makes up ${transportPct}% of your footprint. Switching to public transport or walking twice a week could reduce your annual emissions by approximately 120 kg CO₂.`,
      icon: 'directions-transit',
      color: '#ffb95f'
    });
  } else {
    recs.push({
      title: 'Eco commute recommendation',
      desc: 'You are doing great on travel! Consider joining the No-Car Week challenge to earn 500 extra points and claim a Carbon Ninja badge.',
      icon: 'stars',
      color: '#4edea3'
    });
  }

  if (electricityPct >= 20) {
    recs.push({
      title: 'Optimize energy consumption',
      desc: 'Your electricity is a key footprint contributor. Replacing current lighting with smart LEDs can save another 35 kg CO₂ yearly.',
      icon: 'lightbulb',
      color: '#4edea3'
    });
  } else {
    recs.push({
      title: 'Solar offset suggestion',
      desc: 'Offset your remaining electricity emissions by investing in fractional green energy grids for an estimated 15% ROI.',
      icon: 'wb-sunny',
      color: '#89ceff'
    });
  }

  if (foodPct >= 20) {
    recs.push({
      title: 'Plant-based diet shift',
      desc: 'Meat-related meals add significant CO₂. Transitioning to a vegetarian or vegan diet 2 days a week cuts food emissions by up to 45%.',
      icon: 'eco',
      color: '#89ceff'
    });
  } else {
    recs.push({
      title: 'Zero Waste shopping habit',
      desc: 'Plastic purchases add container waste. ordering in bulk or choosing local grocery refills mitigates shopping emissions.',
      icon: 'shopping-bag',
      color: '#ffb95f'
    });
  }

  return recs;
}

/**
 * POST /api/ai/recommend
 * Returns AI sustainability recommendations given a footprint weight and breakdown.
 * @route POST /api/ai/recommend
 * @param {Object} req.body - Footprint details
 * @returns {Object} 200 - Object containing recommendations array
 * @returns {Object} 500 - Internal server error
 */
router.post('/ai/recommend', async (req, res, next) => {
  try {
    const { footprint, breakdown } = req.body;
    const recs = await generateRecommendations(footprint, breakdown);
    res.json({ recommendations: recs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/challenges
 * Retrieves list of all challenges with user-specific progress.
 * @route GET /api/challenges
 * @returns {Array<Object>} 200 - Array of challenge templates with user progress values
 * @returns {Object} 500 - Internal server error
 */
router.get('/challenges', async (req, res, next) => {
  const userId = getRequestUserId(req);
  try {
    const snapshot = await db.collection('users').doc(userId).collection('challenges').get();
    const progressMap = {};
    snapshot.docs.forEach(doc => {
      progressMap[doc.id] = doc.data();
    });

    const userChallenges = defaultChallenges.map(ch => {
      const saved = progressMap[ch.id];
      if (!saved && userId === 'sarah_j') {
        if (ch.id === '1') return { ...ch, progress: 0.60, completed: false };
        if (ch.id === '3') return { ...ch, progress: 0.85, completed: false };
      }
      return {
        ...ch,
        progress: saved ? saved.progress : 0.0,
        completed: saved ? saved.completed : false
      };
    });

    res.json(userChallenges);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/challenges/:id/join
 * Joins a specific challenge for the current user, setting starting progress to 5%.
 * @route POST /api/challenges/:id/join
 * @param {string} req.params.id - Challenge ID ('1', '2', or '3')
 * @returns {Object} 200 - Success status payload
 * @returns {Object} 400 - Invalid challenge ID error
 * @returns {Object} 500 - Internal server error
 */
router.post('/challenges/:id/join', async (req, res, next) => {
  const userId = getRequestUserId(req);
  const chId = req.params.id;
  if (chId !== '1' && chId !== '2' && chId !== '3') {
    return res.status(400).json({ error: 'Invalid challenge ID parameter' });
  }
  try {
    await db.collection('users').doc(userId).collection('challenges').doc(chId).set({
      progress: 0.05,
      completed: false
    });
    usersCache = null; // Invalidate cache
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/challenges/:id/progress
 * Increments progress of a joined challenge by 10%, rewarding points on completion.
 * @route POST /api/challenges/:id/progress
 * @param {string} req.params.id - Challenge ID ('1', '2', or '3')
 * @returns {Object} 200 - Success status, updated challenge progress, and user profile details
 * @returns {Object} 400 - Invalid challenge ID error
 * @returns {Object} 500 - Internal server error
 */
router.post('/challenges/:id/progress', async (req, res, next) => {
  const userId = getRequestUserId(req);
  const chId = req.params.id;
  if (chId !== '1' && chId !== '2' && chId !== '3') {
    return res.status(400).json({ error: 'Invalid challenge ID parameter' });
  }
  
  try {
    const chDoc = await db.collection('users').doc(userId).collection('challenges').doc(chId).get();
    let progress = 0.0;
    let completed = false;
    
    if (!chDoc.exists && userId === 'sarah_j') {
      if (chId === '1') progress = 0.60;
      if (chId === '3') progress = 0.85;
    } else if (chDoc.exists) {
      progress = chDoc.data().progress || 0.0;
      completed = chDoc.data().completed || false;
    }

    progress = Math.min(progress + 0.10, 1.0);

    const challengeDetails = defaultChallenges.find(c => c.id === chId) || {};
    let pointsAwarded = 0;
    let badgeEarned = null;

    const userDoc = await db.collection('users').doc(userId).get();
    const profile = userDoc.exists ? userDoc.data() : { points: 0, badges: [] };

    if (progress >= 1.0 && !completed) {
      completed = true;
      pointsAwarded = challengeDetails.pointsValue || 100;
      badgeEarned = challengeDetails.associatedBadge;
    }

    await db.collection('users').doc(userId).collection('challenges').doc(chId).set({
      progress,
      completed
    });

    const updatedPoints = (profile.points || 0) + pointsAwarded;
    usersCache = null; // Invalidate cache
    const currentTitle = updatedPoints >= 12000 ? 'Master Guardian' : updatedPoints >= 11000 ? 'Nature Enthusiast' : 'Eco Novice';
    const updatedBadges = [...(profile.badges || [])];
    if (badgeEarned && !updatedBadges.includes(badgeEarned)) {
      updatedBadges.push(badgeEarned);
    }

    const updatedProfile = {
      ...profile,
      points: updatedPoints,
      title: currentTitle,
      badges: updatedBadges
    };

    await db.collection('users').doc(userId).set(updatedProfile);

    res.json({
      success: true,
      challenge: {
        id: chId,
        progress,
        completed
      },
      profile: updatedProfile
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/leaderboard
 * Retrieves leaderboard list sorted by points.
 * @route GET /api/leaderboard
 * @returns {Array<Object>} 200 - List of ranked user objects
 * @returns {Object} 500 - Internal server error
 */
router.get('/leaderboard', async (req, res, next) => {
  try {
    const users = await getAllUsersCached();
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      points: user.points,
      avatar: user.avatar,
      title: user.title,
    }));

    // Sort leaderboard desc
    formattedUsers.sort((a, b) => b.points - a.points);
    
    // Format response
    const rankedLeaderboard = formattedUsers.map((user, index) => {
      const rank = index + 1;
      let borderColor = 'rgba(255,255,255,0.08)';
      let bg = 'rgba(255, 255, 255, 0.03)';
      if (rank === 1) {
        borderColor = '#4edea3';
        bg = 'rgba(78, 222, 163, 0.08)';
      } else if (rank === 2) {
        borderColor = '#89ceff';
      }
      return {
        id: user.id,
        rank,
        name: user.name,
        title: user.title,
        points: user.points,
        avatar: user.avatar,
        borderColor,
        bg
      };
    });

    res.json(rankedLeaderboard);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users
 * Retrieves simple metadata objects for all registered platform users.
 * @route GET /api/users
 * @returns {Array<Object>} 200 - Array of user metadata items
 * @returns {Object} 500 - Internal server error
 */
router.get('/users', async (req, res, next) => {
  try {
    const users = await getAllUsersCached();
    const usersList = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      points: user.points,
      title: user.title,
    }));
    res.json(usersList);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/users
 * Creates / registers a new user profile on the platform, resolving unique slug IDs.
 * @route POST /api/users
 * @param {Object} req.body - Payload specifying 'name' and optional 'email'
 * @returns {Object} 200 - Registration success payload containing the generated userId and profile
 * @returns {Object} 400 - Validation error payload
 * @returns {Object} 500 - Internal server error
 */
router.post('/users', async (req, res, next) => {
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required and must be a valid string' });
  }

  if (name.length > 50) {
    return res.status(400).json({ error: 'Name must be under 50 characters' });
  }

  // Sanitize name to prevent XSS
  const sanitizedName = name.replace(/<[^>]*>/g, '').trim();
  if (!sanitizedName) {
    return res.status(400).json({ error: 'Invalid name characters' });
  }

  // If email is provided, validate its format
  let validatedEmail = email || '';
  if (validatedEmail) {
    if (typeof validatedEmail !== 'string') {
      return res.status(400).json({ error: 'Email must be a valid string' });
    }
    if (validatedEmail.length > 100) {
      return res.status(400).json({ error: 'Email must be under 100 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(validatedEmail.trim())) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }
    validatedEmail = validatedEmail.trim();
  }

  try {
    const trimmedName = sanitizedName;
    
    // Generate unique slug ID
    let baseId = trimmedName.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '');

    if (!baseId) baseId = 'user';

    let userId = baseId;
    let counter = 1;
    let docRef = db.collection('users').doc(userId);
    let docSnap = await docRef.get();

    while (docSnap.exists) {
      userId = `${baseId}_${counter}`;
      docRef = db.collection('users').doc(userId);
      docSnap = await docRef.get();
      counter++;
    }

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(trimmedName)}`;

    const newProfile = {
      email: validatedEmail || `${userId}@example.com`,
      name: trimmedName,
      avatar: avatarUrl,
      title: 'Eco Novice',
      points: 0,
      badges: [],
      percentages: { transport: 20, electricity: 20, food: 20, waste: 20, shopping: 20 },
      complianceRate: '80.0%',
      totalMonthly: 0
    };

    await db.collection('users').doc(userId).set(newProfile);
    usersCache = null; // Invalidate cache

    res.json({
      success: true,
      userId: userId,
      profile: newProfile
    });
  } catch (err) {
    console.error('Error creating user:', err);
    next(err);
  }
});

/**
 * POST /api/offsets/purchase
 * Purchases a carbon offset package, rewarding points to the buyer.
 * @route POST /api/offsets/purchase
 * @param {Object} req.body - Details containing offsetId and cost
 * @returns {Object} 200 - Purchase success payload and updated profile points details
 * @returns {Object} 400 - Validation error payload
 * @returns {Object} 500 - Internal server error
 */
router.post('/offsets/purchase', async (req, res, next) => {
  const userId = getRequestUserId(req);
  const { offsetId, cost } = req.body;

  if (offsetId !== '1' && offsetId !== '2' && offsetId !== '3' && offsetId !== '4') {
    return res.status(400).json({ error: 'Invalid offset ID parameter' });
  }
  if (typeof cost !== 'number' || cost <= 0 || isNaN(cost)) {
    return res.status(400).json({ error: 'Cost must be a valid positive number' });
  }
  
  try {
    const pointsReward = Math.max(Math.round((cost || 10) * 2.5), 50);
    
    const userDoc = await db.collection('users').doc(userId).get();
    const profile = userDoc.exists ? userDoc.data() : { points: 0 };
    
    const updatedPoints = (profile.points || 0) + pointsReward;
    const currentTitle = updatedPoints >= 12000 ? 'Master Guardian' : updatedPoints >= 11000 ? 'Nature Enthusiast' : 'Eco Novice';
    
    const updatedProfile = {
      ...profile,
      points: updatedPoints,
      title: currentTitle
    };
    
    await db.collection('users').doc(userId).set(updatedProfile);
    usersCache = null; // Invalidate cache
    
    res.json({
      success: true,
      pointsReward,
      profile: updatedProfile
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
