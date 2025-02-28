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

export const createThread = async (participants, subject) => {
  try {
    // Validate participant data
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      throw new Error('Invalid participants data');
    }

    // Format participants data, ensuring all required fields are present
    const formattedParticipants = participants.map(p => {
      if (!p.id) throw new Error('Participant missing ID');
      if (!p.role) throw new Error('Participant missing role');
      
      // Ensure role is properly formatted
      const validRoles = ['admin', 'doctor', 'nurse', 'facility_admin'];
      const role = p.role.toLowerCase();
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${p.role}. Must be one of: ${validRoles.join(', ')}`);
      }
      
      return {
        id: p.id,
        name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.email,
        role: role
      };
    });

    const threadRef = await addDoc(collection(db, 'messageThreads'), {
      subject: subject || 'New Thread',
      participants: formattedParticipants.map(p => p.id), // Store only participant IDs
      participantDetails: formattedParticipants, // Store full participant details
      createdAt: serverTimestamp(),
      createdBy: formattedParticipants[formattedParticipants.length - 1].id,
      lastMessage: null,
      lastMessageAt: serverTimestamp(),
      isArchived: false
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
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, {
      threadId,
      content,
      type: 'system',
      sentAt: serverTimestamp(),
      sentBy: 'system',
      senderName: 'System'
    });

    // Update thread's lastMessage
    const threadRef = doc(db, 'messageThreads', threadId);
    await updateDoc(threadRef, {
      lastMessage: content,
      lastMessageAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding system message:', error);
  }
};