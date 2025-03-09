import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

// Initialize Firebase Functions
const functions = getFunctions(app);

/**
 * Get combined patient data from both Firebase projects
 * @param {string} patientId - The ID of the patient to retrieve
 * @returns {Promise<Object>} Combined patient data from both projects
 */
export const getCombinedPatientData = async (patientId) => {
  try {
    const getCombinedPatientDataFn = httpsCallable(functions, 'getCombinedPatientData');
    const result = await getCombinedPatientDataFn({ patientId });
    return result.data;
  } catch (error) {
    console.error('Error getting combined patient data:', error);
    throw error;
  }
};

/**
 * Example of how to use the cross-project service in a component:
 * 
 * import { getCombinedPatientData } from '../services/crossProjectService';
 * 
 * const PatientDetails = ({ patientId }) => {
 *   const [patientData, setPatientData] = useState(null);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState(null);
 * 
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       try {
 *         setLoading(true);
 *         const data = await getCombinedPatientData(patientId);
 *         setPatientData(data);
 *       } catch (err) {
 *         setError(err.message);
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 * 
 *     fetchData();
 *   }, [patientId]);
 * 
 *   // Render component with data from both projects
 * };
 */ 