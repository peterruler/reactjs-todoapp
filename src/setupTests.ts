import '@testing-library/jest-dom';

// Mock für window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock für Crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-1234'
  }
});
