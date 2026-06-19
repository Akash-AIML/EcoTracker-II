import { vi } from 'vitest';
import db from '../utils/firebaseClient.js';

export function resetDb() {
  // Clear the in-memory mock Firestore store between test runs
  if (db._mockStore) {
    for (const key of Object.keys(db._mockStore)) {
      delete db._mockStore[key];
    }
  }
}

const mockPrisma = {
  $disconnect: async () => {},
};

vi.mock('../utils/prismaClient.js', () => {
  return {
    default: mockPrisma,
  };
});
