const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
};

const mockAuth = {
  currentUser: { uid: 'test-uid', email: 'test@example.com' },
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
};

export const auth = mockAuth;
export const db = mockFirestore;

export const app = {
  name: '[DEFAULT]',
  options: {},
};
