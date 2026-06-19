import Groq from 'groq-sdk';
import logger from '../utils/logger.js';

const apiKey = process.env.GROQ_API_KEY;
let groq = null;

if (apiKey) {
  try {
    groq = new Groq({ apiKey });
    logger.info('✅ Groq SDK initialized successfully.');
  } catch (err) {
    logger.error('❌ Failed to initialize Groq SDK:', { error: err.message });
  }
} else {
  logger.warn('⚠️  No GROQ_API_KEY found. AI endpoints will run in Mock Fallback mode.');
}

// Simple in-memory cache for the daily eco tip
let dailyTipCache = {
  date: null,
  tip: null,
};

export const aiService = {
  /**
   * Conversational Eco-Coach Chatbot
   */
  chat: async (message, context = {}) => {
    if (!groq) {
      return {
        reply: `Hi! I'm your CarbonSense Eco Coach. Currently, I'm running in offline demonstration mode. To unlock my full AI intelligence capabilities, please add a valid \`GROQ_API_KEY\` to your backend environment settings.\n\nBased on your message ("${message}"), my recommendation is to reduce daily car travel and review electricity usage!`,
        suggestedActions: [
          'Turn off unused appliances',
          'Consider public transport',
          'Explore green electricity tariffs',
        ],
      };
    }

    try {
      const systemPrompt = `You are CarbonSense Ocean Intelligence Coach, an expert sustainability advisor.
You are helping a user reduce their carbon footprint.
Be encouraging, professional, and practical. Use bullet points for recommendations.
Keep answers concise (max 3 short paragraphs).

${
  context.footprint
    ? `Current User Footprint Context:
- Total Annual Footprint: ${context.footprint} kg CO2e
- Breakdown: Transport: ${context.breakdown?.transport || 0}%, Electricity: ${context.breakdown?.electricity || 0}%, Food: ${context.breakdown?.food || 0}%, Shopping: ${context.breakdown?.shopping || 0}%`
    : ''
}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 350,
      });

      const reply = chatCompletion.choices[0]?.message?.content || 'No response generated.';
      return {
        reply,
        suggestedActions: [
          'Calculate footprint again',
          'Optimize my energy contract',
          'Find cyclable commuting routes',
        ],
      };
    } catch (err) {
      logger.error('Groq Chat completion failed:', { error: err.message || err });
      return {
        reply:
          'I apologize, but my connection to the AI engine timed out. Please try again in a few moments!',
        suggestedActions: [],
      };
    }
  },

  /**
   * Personalized 30-Day Net Zero Action Plan
   */
  generatePlan: async (footprint, breakdown, goal = '20% reduction') => {
    if (!groq) {
      return {
        plan: [
          {
            week: 1,
            actions: [
              'Switch to 100% renewable electricity tariff',
              'Swap one meat meal daily for a plant-based alternative',
            ],
            expectedReduction: 'Approx. 50 kg',
          },
          {
            week: 2,
            actions: [
              'Walk or cycle for all trips under 3 km',
              'Unplug standby electronics when sleeping',
            ],
            expectedReduction: 'Approx. 30 kg',
          },
          {
            week: 3,
            actions: [
              'Wash clothes at 30°C and line-dry instead of tumble drying',
              'Avoid purchasing fast-fashion clothing items',
            ],
            expectedReduction: 'Approx. 40 kg',
          },
          {
            week: 4,
            actions: [
              'Replace three short regional drives with public transit',
              'Conduct a home energy audit',
            ],
            expectedReduction: 'Approx. 60 kg',
          },
        ],
        goal,
      };
    }

    try {
      const prompt = `Generate a structured, personalized 30-day net-zero action plan for a user to achieve their goal of "${goal}".
Annual Footprint: ${footprint} kg CO2e.
Category breakdown: Transport: ${breakdown.transport || 0}%, Energy: ${breakdown.energy || 0}%, Food: ${breakdown.food || 0}%, Shopping: ${breakdown.shopping || 0}%.

Return ONLY a valid JSON object matching this structure:
{
  "plan": [
    {
      "week": 1,
      "actions": ["action 1", "action 2"],
      "expectedReduction": "X kg"
    },
    ...
  ]
}
Ensure it is valid parseable JSON. Do not include markdown code block syntax in your response, just raw JSON.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 500,
      });

      return JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
    } catch (err) {
      logger.error('Groq Plan generation failed:', { error: err.message || err });
      return { plan: [], error: 'Failed to generate plan.' };
    }
  },

  /**
   * Daily Eco Tip (Cached 24h)
   */
  getDailyTip: async () => {
    const today = new Date().toISOString().split('T')[0];
    if (dailyTipCache.date === today && dailyTipCache.tip) {
      return dailyTipCache.tip;
    }

    const defaultTip = {
      tip: 'Wash laundry in cold water (30°C or below). This saves up to 75-90% of the energy used in a cycle, which goes solely toward heating the water!',
      category: 'energy',
      impact: 'Up to 75kg CO2/year saved',
      icon: 'local-laundry-service',
    };

    if (!groq) {
      dailyTipCache = { date: today, tip: defaultTip };
      return defaultTip;
    }

    try {
      const prompt = `Generate a practical, fresh daily eco tip for carbon footprint reduction.
Return ONLY a valid JSON object matching this structure:
{
  "tip": "Tip explanation goes here...",
  "category": "energy" | "transport" | "food" | "shopping",
  "impact": "X kg CO2 saved per year",
  "icon": "icon-identifier-string"
}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
        temperature: 0.9, // Higher temperature for variety
        max_tokens: 150,
      });

      const parsedTip = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
      dailyTipCache = { date: today, tip: parsedTip };
      return parsedTip;
    } catch (err) {
      logger.error('Groq Daily Tip generation failed:', { error: err.message || err });
      return defaultTip;
    }
  },

  /**
   * Carbon Intelligence Score & Feedback
   */
  getScoreFeedback: async (score, breakdown) => {
    if (!groq) {
      return {
        score,
        grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
        feedback: `You scored ${score}/100. Focus on your largest footprint contributor. Reducing meat intake and switching to green electricity tariffs are the highest-yield steps you can take.`,
      };
    }

    try {
      const prompt = `Provide carbon intelligence feedback on a sustainability score of ${score}/100.
Breakdown: Transport: ${breakdown.transport || 0}%, Energy: ${breakdown.energy || 0}%, Food: ${breakdown.food || 0}%, Shopping: ${breakdown.shopping || 0}%.

Return ONLY a valid JSON object matching this structure:
{
  "score": ${score},
  "grade": "A" | "B" | "C" | "D" | "F",
  "feedback": "A short, actionable paragraph of feedback summarizing their emissions profiles."
}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 250,
      });

      return JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
    } catch (err) {
      logger.error('Groq Score Feedback failed:', { error: err.message || err });
      return {
        score,
        grade: 'B',
        feedback: 'Your emissions are moderate. Review transport and food habits.',
      };
    }
  },

  /**
   * Narrative Comparison
   */
  getCompareNarrative: async (totalEmission, breakdown) => {
    if (!groq) {
      return {
        vsGlobal: totalEmission > 4700 ? 'higher' : 'lower',
        standoutCategory: 'transport',
        narrative: `Your annual footprint of ${(totalEmission / 1000).toFixed(1)} tonnes is ${totalEmission > 4700 ? 'above' : 'below'} the global average of 4.7 tonnes. Focus on choosing green modes of transport and reducing consumer electronics purchases to further lower your footprint.`,
      };
    }

    try {
      const prompt = `Compare a user's carbon footprint of ${totalEmission} kg CO2e against the global average (4,700 kg/year).
Breakdown: Transport: ${breakdown.transport || 0}%, Energy: ${breakdown.energy || 0}%, Food: ${breakdown.food || 0}%, Shopping: ${breakdown.shopping || 0}%.

Return ONLY a valid JSON object matching this structure:
{
  "vsGlobal": "higher" | "lower",
  "standoutCategory": "transport" | "energy" | "food" | "shopping",
  "narrative": "A concise paragraph (2-3 sentences) evaluating their standing and highlighting which category has the highest relative impact."
}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 250,
      });

      return JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
    } catch (err) {
      logger.error('Groq Comparison Narrative failed:', { error: err.message || err });
      return {
        vsGlobal: totalEmission > 4700 ? 'higher' : 'lower',
        standoutCategory: 'transport',
        narrative: 'Comparison computed successfully.',
      };
    }
  },
};
