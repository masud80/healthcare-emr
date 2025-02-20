export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn()
};

export const db = {
  collection: jest.fn(),
  doc: jest.fn()
};

export const app = {
  name: 'testApp'
};
