const functions = require('firebase-functions');
const { primaryDb, secondaryDb } = require('./admin');

/**
 * Example function that reads data from one project and writes to another
 */
exports.syncPatientData = functions.firestore
  .document('patients/{patientId}')
  .onCreate(async (snapshot, context) => {
    try {
      const patientId = context.params.patientId;
      const patientData = snapshot.data();
      
      // Log the operation
      console.log(`Syncing patient ${patientId} to secondary project`);
      
      // Add or update the patient in the secondary project
      await secondaryDb.collection('patients').doc(patientId).set({
        ...patientData,
        syncedFromPrimary: true,
        syncTimestamp: new Date()
      });
      
      // Update the primary record to indicate it was synced
      await primaryDb.collection('patients').doc(patientId).update({
        syncedToSecondary: true,
        syncTimestamp: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error syncing patient data:', error);
      throw new functions.https.HttpsError('internal', 'Failed to sync patient data', error);
    }
  });

/**
 * Example function that queries data from both projects and combines results
 */
exports.getCombinedPatientData = functions.https.onCall(async (data, context) => {
  try {
    const { patientId } = data;
    
    // Get patient data from primary project
    const primaryPatientDoc = await primaryDb.collection('patients').doc(patientId).get();
    const primaryPatientData = primaryPatientDoc.exists ? primaryPatientDoc.data() : null;
    
    // Get patient data from secondary project
    const secondaryPatientDoc = await secondaryDb.collection('patients').doc(patientId).get();
    const secondaryPatientData = secondaryPatientDoc.exists ? secondaryPatientDoc.data() : null;
    
    // Combine the data
    return {
      primaryData: primaryPatientData,
      secondaryData: secondaryPatientData,
      combinedAt: new Date()
    };
  } catch (error) {
    console.error('Error getting combined patient data:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get combined patient data', error);
  }
}); 