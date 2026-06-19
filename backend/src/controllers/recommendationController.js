import db from '../utils/firebaseClient.js';
import { AppError } from '../middleware/errorHandler.js';

export const getRecommendations = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;

    const assessmentDoc = await db.collection('assessments').doc(assessmentId).get();
    if (!assessmentDoc.exists) throw new AppError('Assessment not found', 404);

    const recommendationsSnap = await db
      .collection('recommendations')
      .where('assessmentId', '==', assessmentId)
      .get();

    const recommendations = recommendationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    recommendations.sort((a, b) => {
      const pA = priorityOrder[a.priority] || 99;
      const pB = priorityOrder[b.priority] || 99;
      if (pA !== pB) return pA - pB;
      return (b.estimatedSavings || 0) - (a.estimatedSavings || 0);
    });

    res.json({ success: true, data: recommendations, count: recommendations.length });
  } catch (err) {
    next(err);
  }
};
