import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

const initialState = {
  threads: [],
  currentThread: null,
  messages: [],
  loading: false,
  error: null
};

// Async thunks
export const createThread = createAsyncThunk(
  'messaging/createThread',
  async ({ subject, initialMessage, participants = [] }) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Create the thread
    const threadData = {
      subject,
      participants: [currentUser.uid, ...participants], // Include current user
      createdAt: new Date().toISOString(),
      createdBy: currentUser.uid,
      lastMessageAt: new Date().toISOString(),
      isArchived: false
    };
    
    const threadRef = await addDoc(collection(db, 'messageThreads'), threadData);
    
    // Create initial message
    const messageData = {
      threadId: threadRef.id,
      content: initialMessage,
      sentAt: new Date().toISOString(),
      sentBy: currentUser.uid,
      senderName: currentUser.displayName || 'Unknown User'
    };
    
    await addDoc(collection(db, 'messages'), messageData);
    
    return { 
      id: threadRef.id, 
      ...threadData,
      messages: [messageData]
    };
  }
);

export const fetchThreads = createAsyncThunk(
  'messaging/fetchThreads',
  async () => {
    const userId = auth.currentUser.uid;
    const threadsQuery = query(
      collection(db, 'messageThreads'),
      where('participants', 'array-contains', userId),
      where('isArchived', '==', false),
      orderBy('lastMessageAt', 'desc')
    );
    
    const snapshot = await getDocs(threadsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
);

export const fetchThreadMessages = createAsyncThunk(
  'messaging/fetchThreadMessages',
  async (threadId) => {
    // First get thread details
    const threadDoc = await getDoc(doc(db, 'messageThreads', threadId));
    if (!threadDoc.exists()) {
      throw new Error('Thread not found');
    }

    // Then get messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('threadId', '==', threadId),
      orderBy('sentAt', 'asc')
    );
    
    const snapshot = await getDocs(messagesQuery);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      thread: { id: threadDoc.id, ...threadDoc.data() },
      messages
    };
  }
);

export const fetchThreadDetails = createAsyncThunk(
  'messaging/fetchThreadDetails',
  async (threadId) => {
    const threadDoc = await getDoc(doc(db, 'messageThreads', threadId));
    if (!threadDoc.exists()) {
      throw new Error('Thread not found');
    }
    return { id: threadDoc.id, ...threadDoc.data() };
  }
);

export const sendMessage = createAsyncThunk(
  'messaging/sendMessage',
  async ({ threadId, content }) => {
    const messageData = {
      threadId,
      content,
      sentAt: new Date().toISOString(),
      sentBy: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Unknown User'
    };
    
    // Add message
    const docRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update thread's lastMessageAt
    await updateDoc(doc(db, 'messageThreads', threadId), {
      lastMessageAt: messageData.sentAt
    });
    
    return { id: docRef.id, ...messageData };
  }
);

export const archiveThread = createAsyncThunk(
  'messaging/archiveThread',
  async (threadId) => {
    await updateDoc(doc(db, 'messageThreads', threadId), {
      isArchived: true
    });
    return threadId;
  }
);

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    clearCurrentThread: (state) => {
      state.currentThread = null;
      state.messages = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Thread
      .addCase(createThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.threads.unshift(action.payload);
        state.currentThread = action.payload;
        state.loading = false;
      })
      .addCase(createThread.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // Fetch Threads
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.threads = action.payload;
        state.loading = false;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // Fetch Thread Messages
      .addCase(fetchThreadMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreadMessages.fulfilled, (state, action) => {
        state.currentThread = action.payload.thread;
        state.messages = action.payload.messages;
        state.loading = false;
      })
      .addCase(fetchThreadMessages.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // Fetch Thread Details
      .addCase(fetchThreadDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreadDetails.fulfilled, (state, action) => {
        state.currentThread = action.payload;
        state.loading = false;
      })
      .addCase(fetchThreadDetails.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        if (state.currentThread) {
          state.currentThread.lastMessageAt = action.payload.sentAt;
        }
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // Archive Thread
      .addCase(archiveThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter(thread => thread.id !== action.payload);
        if (state.currentThread?.id === action.payload) {
          state.currentThread = null;
        }
        state.loading = false;
      })
      .addCase(archiveThread.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  }
});

export const { clearCurrentThread, setError } = messagingSlice.actions;

// Add selector
export const selectMessaging = (state) => state.messaging;

export default messagingSlice.reducer;
