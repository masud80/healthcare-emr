// Mock Firebase functionality
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockWhere = jest.fn();
const mockQuery = jest.fn();

const mockFirestore = {
  collection: mockCollection,
  doc: mockDoc,
};

const mockAuth = {
  currentUser: { uid: 'testUserId' },
};

export const db = mockFirestore;
export const auth = mockAuth;
export const collection = mockCollection;
export const doc = mockDoc;
export const getDocs = mockGetDocs;
export const addDoc = mockAddDoc;
export const updateDoc = mockUpdateDoc;
export const deleteDoc = mockDeleteDoc;
export const where = mockWhere;
export const query = mockQuery;

// Reset all mocks between tests
export const resetFirebaseMocks = () => {
  mockCollection.mockReset();
  mockDoc.mockReset();
  mockGetDocs.mockReset();
  mockAddDoc.mockReset();
  mockUpdateDoc.mockReset();
  mockDeleteDoc.mockReset();
  mockWhere.mockReset();
  mockQuery.mockReset();
};
