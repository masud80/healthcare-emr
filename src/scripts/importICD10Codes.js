const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function processHierarchy(node, codes = []) {
  // Add the current node's code if it's a leaf node or has a specific code
  if (node.code && !node.code.includes('-')) {
    codes.push({
      code: node.code,
      description: node.desc_full || node.desc
    });
  }
  
  // Process children recursively
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      await processHierarchy(child, codes);
    }
  }
  
  return codes;
}

async function downloadAndProcessCodes() {
  try {
    console.log('Downloading ICD-10 codes...');
    const response = await axios.get('https://raw.githubusercontent.com/LuChang-CS/icd_hierarchical_structure/main/ICD-10-CM/diagnosis_codes.json');
    const hierarchicalCodes = response.data;
    
    console.log('Processing hierarchical structure...');
    const flattenedCodes = [];
    for (const chapter of hierarchicalCodes) {
      await processHierarchy(chapter, flattenedCodes);
    }
    
    return flattenedCodes;
  } catch (error) {
    console.error('Error downloading or processing codes:', error);
    throw error;
  }
}

async function importCodesInBatches(codes) {
  const batchSize = 500;
  let processed = 0;
  
  try {
    for (let i = 0; i < codes.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = codes.slice(i, i + batchSize);
      
      for (const code of currentBatch) {
        const docRef = db.collection('billing_codes').doc();
        batch.set(docRef, {
          procedureCode: code.code,
          procedureType: 'ICD-10',
          description: code.description,
          icd10Code: code.code,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      await batch.commit();
      processed += currentBatch.length;
      console.log(`Processed ${processed} of ${codes.length} codes`);
    }
  } catch (error) {
    console.error('Error in batch import:', error);
    throw error;
  }
}

async function importICD10Codes() {
  try {
    console.log('Starting ICD-10 code import...');
    
    // First, delete existing ICD-10 codes
    const existingCodes = await db.collection('billing_codes')
      .where('procedureType', '==', 'ICD-10')
      .get();
    
    const deleteBatch = db.batch();
    existingCodes.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log('Existing ICD-10 codes deleted');
    
    // Download and process codes
    const codes = await downloadAndProcessCodes();
    console.log(`Found ${codes.length} ICD-10 codes to import`);
    
    // Import all codes
    await importCodesInBatches(codes);
    console.log('ICD-10 codes imported successfully');
    
  } catch (error) {
    console.error('Error importing ICD-10 codes:', error);
  } finally {
    process.exit();
  }
}

// Run the import
importICD10Codes(); 