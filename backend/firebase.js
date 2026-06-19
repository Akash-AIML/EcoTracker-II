const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// ==========================================
// Mock Firestore Class Definition
// ==========================================
class MockDocRef {
  constructor(collectionPath, docId, mockDb) {
    this.collectionPath = collectionPath;
    this.id = docId;
    this.mockDb = mockDb;
  }

  async get() {
    const data = this.mockDb.readDoc(this.collectionPath, this.id);
    return {
      exists: !!data,
      id: this.id,
      data: () => data || null
    };
  }

  async set(data, options = {}) {
    this.mockDb.writeDoc(this.collectionPath, this.id, data, options.merge);
  }

  async update(data) {
    this.mockDb.writeDoc(this.collectionPath, this.id, data, true);
  }

  collection(subCollectionName) {
    return new MockCollectionRef(`${this.collectionPath}/${this.id}/${subCollectionName}`, this.mockDb);
  }
}

class MockCollectionRef {
  constructor(collectionPath, mockDb) {
    this.collectionPath = collectionPath;
    this.mockDb = mockDb;
  }

  doc(id) {
    return new MockDocRef(this.collectionPath, id, this.mockDb);
  }

  async get() {
    const docs = this.mockDb.readCollection(this.collectionPath);
    return {
      docs: docs.map(d => ({
        id: d.id,
        data: () => d.data
      }))
    };
  }
}

class MockDb {
  constructor() {
    this.filePath = path.join(__dirname, 'database.json');
    if (!fs.existsSync(this.filePath)) {
      // Seed initial users & historical records
      const initialSeed = {
        users: {
          'sarah_j': {
            email: 'sarah@example.com',
            name: 'Sarah J.',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R',
            title: 'Master Guardian',
            points: 12450,
            badges: ['Tree Planter', 'Carbon Ninja', 'Zero Waste'],
            percentages: { transport: 45, electricity: 20, food: 20, waste: 10, shopping: 5 },
            complianceRate: '94.2%',
            totalMonthly: 182.4
          },
          'james_w': {
            email: 'james@example.com',
            name: 'James W.',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8P9QWmkdOOWXq6XrcEKt3wdPMsFJNegdG6UQznpU9ZMfLbsW_fKTfuIWlIHInf0YMPE4MLmRNL20P6VlcsCnd6KLkvc2A_RuBSwHsKvwumkpFZT8hQKxSFUve03mZ3vKJhUIOej633ww6102SdmOn6nfPmGNiLv7WvjtVfUwnGDsbyCIQyJ_B9mmnBqpiH6NUy4eYvDJfHlzbdZ2ZhVkzk8p547M03lRA615RwLExviMZ8p62ikv_uMg-K1FGpiL7YAMp8suTSGhZ',
            title: 'Nature Enthusiast',
            points: 11200,
            badges: ['Tree Planter'],
            percentages: { transport: 35, electricity: 30, food: 15, waste: 10, shopping: 10 },
            complianceRate: '88.5%',
            totalMonthly: 210.0
          },
          'mila_k': {
            email: 'mila@example.com',
            name: 'Mila K.',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkzfO_UyJ2G530wb-ov-OwK5ff3WIT-F_PjNiklYBaBkSnYBGSr6Qup5sIOA0s5OdV_QDLc6gODbXBElL5UckyQ-9ktreb80hwwU5qos-sJXJIUnmCOsYy7tFKmczpTrMWwqioCB6SoLP3N7Du7iecb4edZ5a9O_cI7FgGiIxp29xjkaFWOVWfQ26O3L3nh-gswqV1XGraa-PB8EllrAXdrATbGiQycXKanj1dS3hpbO_kdffmXE-76_8Ol_flCoWuo5gdCpgSfkp',
            title: 'Carbon Reducer',
            points: 10890,
            badges: ['Carbon Ninja'],
            percentages: { transport: 40, electricity: 25, food: 15, waste: 10, shopping: 10 },
            complianceRate: '90.1%',
            totalMonthly: 195.0
          }
        },
        'users/sarah_j/history': {
          'Jan': { month: 'Jan', amount: 155 },
          'Feb': { month: 'Feb', amount: 145 },
          'Mar': { month: 'Mar', amount: 130 },
          'Apr': { month: 'Apr', amount: 125 },
          'May': { month: 'May', amount: 112 },
          'Jun': { month: 'Jun', amount: 98 }
        },
        'users/sarah_j/goals': {
          '1': { id: '1', title: 'Reduce footprint by 20%', progress: 0.75, target: '20% Reduction' },
          '2': { id: '2', title: 'Cycle 3 days/week', progress: 0.40, target: '3 Days/Week' }
        },
        'users/sarah_j/challenges': {
          '1': { id: '1', title: 'No-Car Week', points: '+500 pts', pointsValue: 500, timeLeft: '4 days left', progress: 0.60, icon: 'directions-car', color: '#4edea3', bgColor: 'rgba(78, 222, 163, 0.15)', associatedBadge: 'Carbon Ninja' },
          '2': { id: '2', title: 'Vegan Weekend', points: '+250 pts', pointsValue: 250, timeLeft: 'Starts in 12h', progress: 0.00, icon: 'eco', color: '#ffb95f', bgColor: 'rgba(255, 185, 95, 0.15)', associatedBadge: 'Tree Planter' },
          '3': { id: '3', title: 'Plastic-Free', points: '+400 pts', pointsValue: 400, timeLeft: '2 days left', progress: 0.85, icon: 'shopping-bag', color: '#4edea3', bgColor: 'rgba(78, 222, 163, 0.15)', associatedBadge: 'Zero Waste' }
        }
      };
      fs.writeFileSync(this.filePath, JSON.stringify(initialSeed, null, 2));
    }
  }

  read() {
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch (e) {
      return {};
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  readDoc(collectionPath, docId) {
    const data = this.read();
    const collection = data[collectionPath] || {};
    return collection[docId] || null;
  }

  writeDoc(collectionPath, docId, docData, merge = false) {
    const data = this.read();
    if (!data[collectionPath]) {
      data[collectionPath] = {};
    }
    if (merge && data[collectionPath][docId]) {
      data[collectionPath][docId] = { ...data[collectionPath][docId], ...docData };
    } else {
      data[collectionPath][docId] = docData;
    }
    this.write(data);
  }

  readCollection(collectionPath) {
    const data = this.read();
    const collection = data[collectionPath] || {};
    return Object.keys(collection).map(key => ({
      id: key,
      data: collection[key]
    }));
  }
}

// Instantiate mock
const mockDbInstance = new MockDb();
const mockFirestore = {
  collection: (path) => new MockCollectionRef(path, mockDbInstance)
};

// ==========================================
// Firebase Initialization Router
// ==========================================
let db;

async function seedRealFirestore(dbInstance) {
  try {
    const usersSnap = await dbInstance.collection('users').get();
    if (usersSnap.empty) {
      console.log("Seeding real Firestore with default users...");
      const initialUsers = {
        'sarah_j': {
          email: 'sarah@example.com',
          name: 'Sarah J.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1EPgeHbiCyiDKLGp868IabVBLWQJe-FbA4S09aQJipuS6tXAJnHYJnoD4VL-TBLlnzm4xoCEkS_WlOmVhbeXjuNHry4GZPGKfJ5_iQ8X-fVs2ZENwqa0MK2sTi6dgD_hmctOs2tY1U0dbsRFDclOP1Sy81nI9zy56ULwxCR3EAsmngeA71gDstnUUoOs0PVxPurXRdI32iJ5ScLE0CjWgOYh6n808_7lSn7PlX4m0EkobLUHN1beT5h43E4UGhZjiUdK2JjYPK9R',
          title: 'Master Guardian',
          points: 12450,
          badges: ['Tree Planter', 'Carbon Ninja', 'Zero Waste'],
          percentages: { transport: 45, electricity: 20, food: 20, waste: 10, shopping: 5 },
          complianceRate: '94.2%',
          totalMonthly: 182.4
        },
        'james_w': {
          email: 'james@example.com',
          name: 'James W.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8P9QWmkdOOWXq6XrcEKt3wdPMsFJNegdG6UQznpU9ZMfLbsW_fKTfuIWlIHInf0YMPE4MLmRNL20P6VlcsCnd6KLkvc2A_RuBSwHsKvwumkpFZT8hQKxSFUve03mZ3vKJhUIOej633ww6102SdmOn6nfPmGNiLv7WvjtVfUwnGDsbyCIQyJ_B9mmnBqpiH6NUy4eYvDJfHlzbdZ2ZhVkzk8p547M03lRA615RwLExviMZ8p62ikv_uMg-K1FGpiL7YAMp8suTSGhZ',
          title: 'Nature Enthusiast',
          points: 11200,
          badges: ['Tree Planter'],
          percentages: { transport: 35, electricity: 30, food: 15, waste: 10, shopping: 10 },
          complianceRate: '88.5%',
          totalMonthly: 210.0
        },
        'mila_k': {
          email: 'mila@example.com',
          name: 'Mila K.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkzfO_UyJ2G530wb-ov-OwK5ff3WIT-F_PjNiklYBaBkSnYBGSr6Qup5sIOA0s5OdV_QDLc6gODbXBElL5UckyQ-9ktreb80hwwU5qos-sJXJIUnmCOsYy7tFKmczpTrMWwqioCB6SoLP3N7Du7iecb4edZ5a9O_cI7FgGiIxp29xjkaFWOVWfQ26O3L3nh-gswqV1XGraa-PB8EllrAXdrATbGiQycXKanj1dS3hpbO_kdffmXE-76_8Ol_flCoWuo5gdCpgSfkp',
          title: 'Carbon Reducer',
          points: 10890,
          badges: ['Carbon Ninja'],
          percentages: { transport: 40, electricity: 25, food: 15, waste: 10, shopping: 10 },
          complianceRate: '90.1%',
          totalMonthly: 195.0
        }
      };

      for (const [uid, userProfile] of Object.entries(initialUsers)) {
        await dbInstance.collection('users').doc(uid).set(userProfile);
      }

      // Seed history for sarah_j
      const historyItems = [
        { month: 'Jan', amount: 155 },
        { month: 'Feb', amount: 145 },
        { month: 'Mar', amount: 130 },
        { month: 'Apr', amount: 125 },
        { month: 'May', amount: 112 },
        { month: 'Jun', amount: 98 }
      ];
      for (const item of historyItems) {
        await dbInstance.collection('users').doc('sarah_j').collection('history').doc(item.month).set(item);
      }

      // Seed goals for sarah_j
      const goalsItems = [
        { id: '1', title: 'Reduce footprint by 20%', progress: 0.75, target: '20% Reduction' },
        { id: '2', title: 'Cycle 3 days/week', progress: 0.40, target: '3 Days/Week' }
      ];
      for (const item of goalsItems) {
        await dbInstance.collection('users').doc('sarah_j').collection('goals').doc(item.id).set(item);
      }

      // Seed challenges for sarah_j
      const challengesItems = [
        { id: '1', progress: 0.60, completed: false },
        { id: '2', progress: 0.00, completed: false },
        { id: '3', progress: 0.85, completed: false }
      ];
      for (const item of challengesItems) {
        await dbInstance.collection('users').doc('sarah_j').collection('challenges').doc(item.id).set(item);
      }
      console.log("Firestore seeding finished successfully.");
    } else {
      console.log("Firestore is not empty. Skipping seeding.");
    }
  } catch (err) {
    console.error("Firestore seeding failed:", err);
  }
}

// Load Firebase credentials (either from env variable or local json file)
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("Firebase service credentials loaded from FIREBASE_SERVICE_ACCOUNT environment variable.");
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err);
  }
}

const keyPath = path.join(__dirname, 'firebase-key.json');
if (!serviceAccount && fs.existsSync(keyPath)) {
  try {
    serviceAccount = require(keyPath);
    console.log("Firebase service credentials loaded from firebase-key.json.");
  } catch (err) {
    console.error("Failed to load firebase-key.json:", err);
  }
}

if (serviceAccount) {
  try {
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log("=========================================");
    console.log(" EcoTrack AI Connected to Firebase Firestore");
    console.log("=========================================");
    
    // Seed real Firestore asynchronously
    seedRealFirestore(db);
  } catch (err) {
    console.error("Firebase init failed, falling back to local file db:", err);
  }
}

if (!db) {
  db = mockFirestore;
  console.log("=========================================");
  console.log(" EcoTrack AI Running with Local Mock Firestore");
  console.log(" DB File: backend/database.json");
  console.log(" Add firebase-key.json to backend/ to connect to real Firestore.");
  console.log("=========================================");
}

module.exports = db;

