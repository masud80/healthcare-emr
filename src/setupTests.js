const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { configure } = require('@testing-library/dom');
configure({ testIdAttribute: 'data-testid' });

require('@babel/runtime/regenerator');
require('regenerator-runtime/runtime');
require('core-js/stable');
require('regenerator-runtime/runtime');

// Import jest-dom using require.resolve to handle the path correctly
require(require.resolve('@testing-library/jest-dom'));

require('fake-indexeddb/auto');
require('jest-fetch-mock').enableMocks();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock Firebase
jest.mock('./firebase/config', () => ({
  auth: {
    currentUser: { uid: 'testUserId' },
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn()
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(),
      add: jest.fn(),
      get: jest.fn(),
      where: jest.fn(),
      onSnapshot: jest.fn()
    }))
  }
}));

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false)
}));

// Mock Redux store
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}));
