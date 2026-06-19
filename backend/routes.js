const express = require('express');
const router = express.Router();
const db = require('./firebase');

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

// Helper to get active user ID from request
function getRequestUserId(req) {
  return req.headers['x-user-id'] || req.query.userId || 'sarah_j';
}

// ==========================================
// API Endpoints (Firestore Powered)
// ==========================================

// 1. Get Calculator Config Presets
router.get('/config', (req, res) => {
  res.json(staticConfig);
});

// 2. Get User Profile info
router.get('/profile', async (req, res) => {
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
    console.error('Error in /profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get global ticker statistics (landing page)
router.get('/stats', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const userCount = snapshot.docs.length;
    res.json({
      globalReduction: '-14.2%',
      globalSavedTons: '12 Tons',
      activeProjectCount: `${Math.max(userCount * 12 + 50000, 50000).toLocaleString()}+`,
      treesRestoredCount: `${Math.max(userCount, 8000).toLocaleString()}+`,
      aiPrecision: '99.9%',
    });
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

// 3b. Get Dashboard Insights
router.get('/insights', async (req, res) => {
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
      recommendations: generateRecommendations(totalMonthly, percentages)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Calculate Full-Spectrum Carbon Footprint
router.post('/carbon/calculate', (req, res) => {
  const { transport, electricity, food, waste, shopping } = req.body;

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

// 5. Save footprint calculation to database history
router.post('/footprint/save', async (req, res) => {
  const userId = getRequestUserId(req);
  const { monthlyEmission, breakdown } = req.body;

  if (monthlyEmission === undefined) {
    return res.status(400).json({ error: 'Missing monthlyEmission value' });
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

    // Fetch updated history list
    const snapshot = await db.collection('users').doc(userId).collection('history').get();
    const historyList = snapshot.docs.map(doc => doc.data());

    res.json({
      success: true,
      history: historyList,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Historical calculations timeline
router.get('/history', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// 7. Get user goals
router.get('/goals', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// 8. Add user goal
router.post('/goals', async (req, res) => {
  const userId = getRequestUserId(req);
  const { title, target } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing goal title' });

  try {
    const snapshot = await db.collection('users').doc(userId).collection('goals').get();
    const newId = String(snapshot.docs.length + 1);

    const newGoal = {
      id: newId,
      title,
      progress: 0.0,
      target: target || 'Active Target'
    };

    await db.collection('users').doc(userId).collection('goals').doc(newId).set(newGoal);

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
    res.status(500).json({ error: err.message });
  }
});

// Helper to generate AI recommendations
function generateRecommendations(footprint, breakdown) {
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

// 9. Get AI sustainability recommendations
router.post('/ai/recommend', (req, res) => {
  const { footprint, breakdown } = req.body;
  const recs = generateRecommendations(footprint, breakdown);
  res.json({ recommendations: recs });
});

// 10. Get challenges
router.get('/challenges', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// 11. Join challenge
router.post('/challenges/:id/join', async (req, res) => {
  const userId = getRequestUserId(req);
  const chId = req.params.id;
  try {
    await db.collection('users').doc(userId).collection('challenges').doc(chId).set({
      progress: 0.05,
      completed: false
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Update progress / complete challenge
router.post('/challenges/:id/progress', async (req, res) => {
  const userId = getRequestUserId(req);
  const chId = req.params.id;
  
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
    res.status(500).json({ error: err.message });
  }
});

// 13. Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || doc.id,
        points: data.points || 0,
        avatar: data.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R',
        title: data.title || 'Eco Novice',
      };
    });

    // Sort leaderboard desc
    users.sort((a, b) => b.points - a.points);
    
    // Format response
    const rankedLeaderboard = users.map((user, index) => {
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
    res.status(500).json({ error: err.message });
  }
});

// 13b. Get all users
router.get('/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || doc.id,
        email: data.email || '',
        avatar: data.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R',
        points: data.points || 0,
        title: data.title || 'Eco Novice',
      };
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13c. Create a new user
router.post('/users', async (req, res) => {
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

    res.json({
      success: true,
      userId: userId,
      profile: newProfile
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// 14. Purchase carbon offset
router.post('/offsets/purchase', async (req, res) => {
  const userId = getRequestUserId(req);
  const { offsetId, cost } = req.body;
  
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
    
    res.json({
      success: true,
      pointsReward,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
