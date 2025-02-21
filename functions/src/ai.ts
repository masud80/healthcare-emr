import { onCall } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defineString } from "firebase-functions/params";

const geminiApiKey = defineString('GEMINI_API_KEY');

interface Visit {
  date: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
  };
  symptoms: string[];
  actionPlan: string;
  notes: string;
}

interface PatientData {
  dateOfBirth: string;
  visits: Visit[];
}

export const analyzePatient = onCall({
  cors: [/localhost/]
}, async (request) => {
  try {
    // Initialize Gemini AI with the API key from config
    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    
    const { data, auth } = request;

    // Validate and type check the input data
    if (!data || typeof data !== 'object' || !('dateOfBirth' in data) || !('visits' in data)) {
      throw new HttpsError(
        'invalid-argument',
        'Invalid patient data format'
      );
    }

    const patientData = data as PatientData;
    
    if (!auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Format the data for the prompt
    const visitsText = patientData.visits.map(visit => `
      Date: ${visit.date}
      Vitals:
        - Blood Pressure: ${visit.vitals.bloodPressure}
        - Heart Rate: ${visit.vitals.heartRate}
        - Temperature: ${visit.vitals.temperature}
      Symptoms: ${visit.symptoms.join(', ')}
      Action Plan: ${visit.actionPlan}
      Notes: ${visit.notes}
    `).join('\n\n');

    const prompt = `
      Analyze the following patient data:
      
      Date of Birth: ${patientData.dateOfBirth}
      
      Last 5 Visits:
      ${visitsText}
      
      Please provide:
      1. A brief analysis of vital signs trends
      2. Key observations about symptoms patterns
      3. Effectiveness of previous action plans
      4. Recommendations for future care
      
      Format the response in clear, concise bullet points.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      analysis: text,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error analyzing patient:', error);
    if (error instanceof HttpsError) {
      throw error; // Re-throw HTTP errors
    }
    throw new HttpsError(
      'internal',
      'Error analyzing patient data: ' + (error instanceof Error ? error.message : String(error))
    );
  }
});
