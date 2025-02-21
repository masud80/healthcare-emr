import { getFunctions, httpsCallable } from 'firebase/functions';

// Format visit data for the AI analysis
const formatVisitData = (dateOfBirth, visits) => {
  const lastFiveVisits = visits.slice(0, 5).map(visit => ({
    date: visit.createdAt,
    vitals: {
      bloodPressure: visit.vitals.bloodPressure,
      heartRate: visit.vitals.heartRate,
      temperature: visit.vitals.temperature
    },
    symptoms: visit.symptoms,
    actionPlan: visit.actionPlan,
    notes: visit.notes.consultationNotes
  }));

  return {
    dateOfBirth,
    visits: lastFiveVisits
  };
};

// Get AI insights for patient visits
export const getAIInsights = async (dateOfBirth, visits) => {
  try {
    const functions = getFunctions();
    const analyzePatient = httpsCallable(functions, 'analyzePatient');
    
    const formattedData = formatVisitData(dateOfBirth, visits);
    const result = await analyzePatient(formattedData);
    
    if (!result.data.success) {
      throw new Error(result.data.error || 'Failed to analyze patient data');
    }
    
    return {
      analysis: result.data.analysis,
      timestamp: result.data.timestamp
    };
  } catch (error) {
    console.error('Error getting AI insights:', error);
    throw error;
  }
};
