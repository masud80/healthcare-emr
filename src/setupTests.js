// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock the entire @mui/x-date-pickers module
jest.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ children, ...props }) => <div {...props}>{children}</div>,
  LocalizationProvider: ({ children, ...props }) => <div {...props}>{children}</div>,
  AdapterDateFns: class {
    constructor() {}
    date() { return new Date(); }
    format() { return ''; }
    parse() { return new Date(); }
  }
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(date => date.toISOString()),
  parse: jest.fn(),
  isValid: jest.fn(() => true),
  isDate: jest.fn(() => true),
  _lib: {
    format: {
      longFormatters: {}
    }
  }
}));

// Mock firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn()
}));

// Mock window.confirm
window.confirm = jest.fn(() => true);

// Suppress console errors during tests
console.error = jest.fn();
