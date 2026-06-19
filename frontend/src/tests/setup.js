import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock window.scrollTo since JSDOM does not implement layout/scrolling
window.scrollTo = () => {};

// Define a robust, standard mock for localStorage
const mockStorage = {};
const localStorageMock = {
  getItem: vi.fn((key) => mockStorage[key] || null),
  setItem: vi.fn((key, value) => {
    mockStorage[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
  }),
  length: 0,
  key: vi.fn((index) => Object.keys(mockStorage)[index] || null),
};

// Delete Node's experimental global.localStorage to prevent conflicts/warnings
try {
  delete globalThis.localStorage;
} catch (e) {
  // Ignored
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

if (typeof window !== 'undefined') {
  try {
    delete window.localStorage;
  } catch (e) {
    // Ignored
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
}
