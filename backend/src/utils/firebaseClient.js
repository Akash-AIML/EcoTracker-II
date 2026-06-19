import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount = null;

// 1. Try environment variable
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    logger.info('Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT environment variable.');
  } catch (err) {
    logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', {
      error: err.message || err,
    });
  }
}

// 2. Try local firebase-key.json
const keyPath = path.resolve(__dirname, '../../firebase-key.json');
if (!serviceAccount && fs.existsSync(keyPath)) {
  try {
    const rawKey = fs.readFileSync(keyPath, 'utf8');
    serviceAccount = JSON.parse(rawKey);
    logger.info('Firebase credentials loaded from firebase-key.json.');
  } catch (err) {
    logger.error('Failed to load firebase-key.json:', { error: err.message || err });
  }
}

let db;

if (serviceAccount && process.env.NODE_ENV !== 'test') {
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
    db = getFirestore();
    logger.info('EcoGuide Connected to Firebase Firestore');
  } catch (err) {
    logger.error('Firebase initialization failed:', { error: err.message || err });
  }
}

if (!db) {
  // Safe mock db for testing or local development fallback
  logger.info('EcoGuide Running with IN-MEMORY / MOCK Firestore');

  // Minimal Firestore mock interface
  class MockDoc {
    constructor(data, id) {
      this.id = id;
      this._data = data;
      this.exists = !!data;
    }
    data() {
      return this._data || null;
    }
  }

  class MockQuerySnapshot {
    constructor(docs) {
      this.docs = docs;
      this.empty = docs.length === 0;
    }
  }

  class MockCollection {
    constructor(name, parentDoc = null) {
      this.name = name;
      this.parentDoc = parentDoc;
    }

    doc(id) {
      const self = this;
      return {
        id,
        get: async () => {
          // Access the globally mocked store
          const path = self.getPath(id);
          const data = mockStore[path];
          return new MockDoc(data, id);
        },
        set: async (data) => {
          const path = self.getPath(id);
          mockStore[path] = { ...data };
        },
        update: async (data) => {
          const path = self.getPath(id);
          mockStore[path] = { ...(mockStore[path] || {}), ...data };
        },
        delete: async () => {
          const path = self.getPath(id);
          delete mockStore[path];
        },
        collection: (subName) => {
          return new MockCollection(subName, { path: self.getPath(id) });
        },
      };
    }

    getPath(docId) {
      if (this.parentDoc) {
        return `${this.parentDoc.path}/${this.name}/${docId}`;
      }
      return `${this.name}/${docId}`;
    }

    async get() {
      const prefix = this.parentDoc ? `${this.parentDoc.path}/${this.name}/` : `${this.name}/`;
      const matchedDocs = [];
      for (const [key, val] of Object.entries(mockStore)) {
        if (key.startsWith(prefix)) {
          const parts = key.slice(prefix.length).split('/');
          if (parts.length === 1) {
            matchedDocs.push(new MockDoc(val, parts[0]));
          }
        }
      }
      return new MockQuerySnapshot(matchedDocs);
    }

    where(field, op, value) {
      const self = this;
      return {
        get: async () => {
          const snapshot = await self.get();
          const filtered = snapshot.docs.filter((doc) => {
            const val = doc.data()?.[field];
            if (op === '==') return val === value;
            return false;
          });
          return new MockQuerySnapshot(filtered);
        },
      };
    }
  }

  // Global in-memory storage for the mock Firestore
  const mockStore = {};

  db = {
    collection: (name) => new MockCollection(name),
    _mockStore: mockStore, // Expose for testing
  };
}

export default db;
