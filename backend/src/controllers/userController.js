import { z } from 'zod';
import db from '../utils/firebaseClient.js';
import { AppError } from '../middleware/errorHandler.js';
import { sanitizeText } from '../utils/sanitize.js';
import crypto from 'crypto';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
});

export const createUser = async (req, res, next) => {
  try {
    const { name, email } = createUserSchema.parse(req.body);
    const sanitizedName = sanitizeText(name);
    const sanitizedEmail = sanitizeText(email).toLowerCase();

    const usersRef = db.collection('users');
    const qSnapshot = await usersRef.where('email', '==', sanitizedEmail).get();

    let userId;
    let userData;

    if (!qSnapshot.empty) {
      const userDoc = qSnapshot.docs[0];
      userId = userDoc.id;
      userData = {
        ...userDoc.data(),
        name: sanitizedName,
        updatedAt: new Date().toISOString(),
      };
      await usersRef.doc(userId).set(userData);
    } else {
      userId = crypto.randomUUID();
      userData = {
        id: userId,
        name: sanitizedName,
        email: sanitizedEmail,
        points: 0,
        badges: [],
        title: 'Eco Novice',
        streak: { current: 0, longest: 0, lastSaved: null },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await usersRef.doc(userId).set(userData);
    }

    const assessmentsSnapshot = await db
      .collection('assessments')
      .where('userId', '==', userId)
      .get();
    const assessmentsCount = assessmentsSnapshot.docs.length;

    res.status(201).json({
      success: true,
      data: {
        ...userData,
        id: userId,
        _count: { assessments: assessmentsCount },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedId = sanitizeText(id);

    const userDoc = await db.collection('users').doc(sanitizedId).get();
    if (!userDoc.exists) {
      throw new AppError('User not found', 404);
    }

    const userData = userDoc.data();
    const assessmentsSnapshot = await db
      .collection('assessments')
      .where('userId', '==', sanitizedId)
      .get();
    const assessmentsCount = assessmentsSnapshot.docs.length;

    res.json({
      success: true,
      data: {
        ...userData,
        id: sanitizedId,
        _count: { assessments: assessmentsCount },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const usersSnap = await db.collection('users').get();
    const usersList = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    usersList.sort((a, b) => (b.points || 0) - (a.points || 0));

    const total = usersList.length;
    const paginatedUsers = usersList.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
