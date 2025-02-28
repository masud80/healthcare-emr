import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

export const updateThreadParticipants = async (threadId, newParticipant) => {
  try {
    const threadRef = doc(db, 'messageThreads', threadId);
    const threadDoc = await getDoc(threadRef);
    
    if (!threadDoc.exists()) {
      throw new Error('Thread not found');
    }

    // Add new participant to the thread
    await updateDoc(threadRef, {
      participants: arrayUnion({
        id: newParticipant.id,
        name: newParticipant.name,
        role: newParticipant.role
      })
    });

    // Add system message about new participant
    await addSystemMessage(threadId, `${newParticipant.name} was added to the thread`);

  } catch (error) {
    console.error('Error updating thread participants:', error);
    throw error;
  }
};

export const createThread = async (participants) => {
  try {
    const threadRef = await addDoc(collection(db, 'messageThreads'), {
      participants: participants.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role
      })),
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null
    });

    // Add initial system message
    await addSystemMessage(threadRef.id, 'Thread created');

    return threadRef;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

export const addSystemMessage = async (threadId, content) => {
  try {
    const messagesRef = collection(db, 'messageThreads', threadId, 'messages');
    await addDoc(messagesRef, {
      content,
      type: 'system',
      sentAt: serverTimestamp(),
      senderId: 'system'
    });
  } catch (error) {
    console.error('Error adding system message:', error);
  }
};