#!/usr/bin/env node

/**
 * Firebase Firestore Indexes Manager
 * 
 * This script handles both fetching indexes from Firebase and merging them with local indexes.
 * It replaces the Windows-specific PowerShell and batch scripts with a cross-platform solution.
 * 
 * Usage:
 *   - Run without arguments to fetch, merge, and optionally deploy indexes
 *   - Run with --merge-only to only merge indexes without fetching
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createInterface } from 'readline';
import dotenv from 'dotenv';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

// Configuration
const outputFile = path.join(rootDir, 'firestore.indexes.json');
const healthcareIndexPath = path.join(__dirname, 'load-latest.json');
const hospiceIndexPath = path.join(__dirname, 'last-deployed.json');
const tempIndexesFile = path.join(__dirname, 'temp_firebase_indexes.json');

// Default index structure
const DEFAULT_INDEX_STRUCTURE = {
  indexes: [],
  fieldOverrides: []
};

// Parse command line arguments
const args = process.argv.slice(2);
const mergeOnly = args.includes('--merge-only');

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for user input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Helper function to safely parse JSON with error handling
function safeParseJSON(filePath, defaultValue = DEFAULT_INDEX_STRUCTURE) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}, using default value`);
      return defaultValue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for BOM character and remove if present
    const cleanContent = content.charCodeAt(0) === 0xFEFF 
      ? content.slice(1) 
      : content;
    
    try {
      const parsed = JSON.parse(cleanContent);
      
      // Ensure indexes is an array
      if (!Array.isArray(parsed.indexes)) {
        console.warn(`Warning: indexes in ${filePath} is not an array. Using empty array instead.`);
        parsed.indexes = [];
      }
      
      // Ensure fieldOverrides is an array or object
      if (!Array.isArray(parsed.fieldOverrides) && typeof parsed.fieldOverrides !== 'object') {
        console.warn(`Warning: fieldOverrides in ${filePath} is not valid. Converting to empty array.`);
        parsed.fieldOverrides = [];
      }
      
      return parsed;
    } catch (parseError) {
      console.error(`Error parsing JSON from ${filePath}: ${parseError.message}`);
      console.log('Using default value instead');
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    console.log('Using default value instead');
    return defaultValue;
  }
}

// Helper function to check if an index already exists
function indexExists(index, indexArray) {
  const indexStr = JSON.stringify(index);
  return indexArray.some(existingIndex => JSON.stringify(existingIndex) === indexStr);
}

// Helper function to create a default index file if it doesn't exist
function ensureIndexFileExists(filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    fs.writeFileSync(filePath, JSON.stringify(DEFAULT_INDEX_STRUCTURE, null, 2), 'utf8');
    console.log(`Created default index file at ${filePath}`);
  }
}

// Function to get the Firebase project ID
async function getProjectId() {
  // Try to get project ID from .env file
  try {
    const envPath = path.join(rootDir, '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      
      // Check for different environment variable formats
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 
                        process.env.REACT_APP_FIREBASE_PROJECT_ID;
      
      if (projectId) {
        console.log(`Found project ID in .env file: ${projectId}`);
        return projectId;
      }
    }
  } catch (error) {
    console.warn(`Error reading .env file: ${error.message}`);
  }
  
  // Try to get project ID from Firebase CLI
  try {
    const projectsOutput = execSync('firebase projects:list', { encoding: 'utf8' });
    const currentProjectMatch = projectsOutput.match(/(\S+).*\(current\)/);
    
    if (currentProjectMatch && currentProjectMatch[1]) {
      const projectId = currentProjectMatch[1];
      console.log(`Current project from Firebase: ${projectId}`);
      return projectId;
    }
    
    // Try alternative method
    const configOutput = execSync('firebase use', { encoding: 'utf8' });
    const configMatch = configOutput.match(/Now using project (.+)/);
    
    if (configMatch && configMatch[1]) {
      const projectId = configMatch[1];
      console.log(`Using project from config: ${projectId}`);
      return projectId;
    }
  } catch (error) {
    console.warn(`Error checking Firebase configuration: ${error.message}`);
  }
  
  // Ask for project ID if not found
  console.warn('No active Firebase project found.');
  const projectId = await prompt('Enter Firebase project ID (leave empty to continue): ');
  
  if (projectId) {
    try {
      execSync(`firebase use ${projectId}`, { encoding: 'utf8' });
      console.log(`Set project to ${projectId}`);
      return projectId;
    } catch (error) {
      console.error(`Error setting project: ${error.message}`);
    }
  }
  
  return null;
}

// Function to extract valid JSON from Firebase CLI output
function extractJsonFromFirebaseOutput(content, outputFile) {
  // Extract JSON from the output - find the first { and the last }
  const jsonStartIndex = content.indexOf('{');
  const jsonEndIndex = content.lastIndexOf('}') + 1;
  
  if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
    const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
    
    try {
      // Parse and stringify to ensure valid JSON
      const parsedJson = JSON.parse(jsonContent);
      fs.writeFileSync(outputFile, JSON.stringify(parsedJson, null, 2), 'utf8');
      console.log('Successfully extracted and validated JSON from Firebase output.');
      return true;
    } catch (parseError) {
      console.warn(`Error parsing extracted JSON: ${parseError.message}`);
    }
  } else {
    console.warn('Could not find valid JSON in Firebase output');
  }
  
  // Create a default structure if extraction failed
  fs.writeFileSync(outputFile, JSON.stringify(DEFAULT_INDEX_STRUCTURE, null, 2), 'utf8');
  console.warn('Created default indexes file as fallback');
  return false;
}

// Function to fetch indexes from Firebase
async function fetchIndexes(projectId) {
  console.log('Fetching current indexes from Firebase...');
  
  // Clean up any existing temp file
  if (fs.existsSync(tempIndexesFile)) {
    fs.unlinkSync(tempIndexesFile);
  }
  
  if (!projectId) {
    console.warn('Could not determine current project. Skipping fetch.');
    ensureIndexFileExists(healthcareIndexPath);
    return false;
  }
  
  try {
    // Try to export the indexes directly to a file
    console.log(`Using project: ${projectId}`);
    console.log('Exporting indexes to file...');
    
    try {
      // Try using the firebase CLI directly
      execSync(`firebase firestore:indexes --project ${projectId} > ${tempIndexesFile}`, { encoding: 'utf8' });
      
      // Check if the file is valid
      if (!fs.existsSync(tempIndexesFile) || fs.statSync(tempIndexesFile).size === 0) {
        throw new Error('Failed to fetch valid indexes');
      }
      
      // Read the file content
      const content = fs.readFileSync(tempIndexesFile, 'utf8');
      
      // Extract JSON from the output
      extractJsonFromFirebaseOutput(content, tempIndexesFile);
      
      console.log('Successfully processed indexes from Firebase.');
      
      // Save the fetched indexes to the healthcare indexes file
      fs.copyFileSync(tempIndexesFile, healthcareIndexPath);
      console.log(`Saved healthcare indexes to ${healthcareIndexPath}`);
      
      // Clean up the temporary file
      fs.unlinkSync(tempIndexesFile);
      return true;
    } catch (error) {
      console.warn(`Error fetching indexes: ${error.message}`);
      ensureIndexFileExists(healthcareIndexPath);
      return false;
    }
  } catch (error) {
    console.warn(`Failed to fetch indexes from Firebase: ${error.message}`);
    ensureIndexFileExists(healthcareIndexPath);
    return false;
  }
}

// Function to merge indexes
function mergeIndexes() {
  console.log('Merging indexes...');
  
  // Ensure index files exist
  ensureIndexFileExists(outputFile);
  
  // Load the index files
  const healthcareIndexes = safeParseJSON(healthcareIndexPath);
  const hospiceIndexes = safeParseJSON(outputFile);
  
  console.log(`Loaded healthcare indexes from ${healthcareIndexPath}`);
  console.log(`Found ${healthcareIndexes.indexes ? healthcareIndexes.indexes.length : 0} healthcare indexes`);
  
  console.log(`Loaded hospice indexes from ${hospiceIndexPath}`);
  console.log(`Found ${hospiceIndexes.indexes ? hospiceIndexes.indexes.length : 0} hospice indexes`);
  
  // Start with the healthcare indexes (which already contain both healthcare and hospice indexes from Firebase)
  const mergedIndexes = {
    indexes: [...(Array.isArray(healthcareIndexes.indexes) ? healthcareIndexes.indexes : [])],
    fieldOverrides: Array.isArray(healthcareIndexes.fieldOverrides) 
      ? [...healthcareIndexes.fieldOverrides] 
      : []
  };
  
  // Add any hospice indexes that don't already exist
  let addedCount = 0;
  if (Array.isArray(hospiceIndexes.indexes)) {
    hospiceIndexes.indexes.forEach(hospiceIndex => {
      if (!indexExists(hospiceIndex, mergedIndexes.indexes)) {
        mergedIndexes.indexes.push(hospiceIndex);
        addedCount++;
      }
    });
  }
  console.log(`Added ${addedCount} new hospice-specific indexes that weren't already in Firebase`);
  
  // Ensure fieldOverrides is an array, not an object
  if (!Array.isArray(mergedIndexes.fieldOverrides)) {
    console.warn('Warning: fieldOverrides is not an array. Converting to empty array.');
    mergedIndexes.fieldOverrides = [];
  }
  
  // Write the merged file with UTF-8 encoding without BOM
  try {
    fs.writeFileSync(outputFile, JSON.stringify(mergedIndexes, null, 2), 'utf8');
    console.log(`Indexes merged successfully to ${outputFile}`);
    console.log(`Total indexes: ${mergedIndexes.indexes.length}`);
    console.log(`Total field overrides: ${mergedIndexes.fieldOverrides.length}`);
    return true;
  } catch (error) {
    console.error(`Error writing merged file: ${error.message}`);
    return false;
  }
}

// Function to deploy indexes
async function deployIndexes(projectId) {
  // Check if we're being called from the wrapper script
  const isFromWrapper = process.env.FIREBASE_WRAPPER_SYNC === 'true';
  
  // If called from wrapper, don't prompt for deployment
  if (isFromWrapper) {
    console.log('Indexes were merged but not deployed. Run "firebase deploy --only firestore:indexes" to deploy them.');
    return;
  }
  
  const shouldDeploy = await prompt('Do you want to deploy the merged indexes now? (y/n): ');
  
  if (shouldDeploy.toLowerCase() === 'y') {
    console.log('Deploying indexes...');
    
    // Verify firebase.json exists
    const firebaseJsonPath = path.join(rootDir, 'firebase.json');
    if (fs.existsSync(firebaseJsonPath)) {
      console.log(`Found firebase.json at ${firebaseJsonPath}`);
      
      try {
        // Use direct Firebase CLI command to avoid wrapper recursion
        const firebaseBin = process.platform === 'win32' 
          ? 'firebase.cmd' 
          : 'firebase';
        
        const deployCommand = projectId 
          ? `${firebaseBin} deploy --only firestore:indexes --project ${projectId}` 
          : `${firebaseBin} deploy --only firestore:indexes`;
        
        execSync(deployCommand, { 
          stdio: 'inherit',
          cwd: rootDir
        });
        
        console.log('Indexes deployed successfully.');
      } catch (error) {
        console.error(`Error deploying indexes: ${error.message}`);
      }
    } else {
      console.error(`Error: firebase.json not found at ${firebaseJsonPath}`);
    }
  } else {
    console.log('Indexes were merged but not deployed. Run "firebase deploy --only firestore:indexes" to deploy them.');
  }
}

// Main function
async function main() {
  console.log('Starting Firestore indexes synchronization and deployment process...');
  
  try {
    if (mergeOnly) {
      console.log('Running in merge-only mode (skipping fetch)...');
      // Only merge indexes
      const mergeSuccess = mergeIndexes();
      
      if (mergeSuccess) {
        console.log('Indexes merged successfully in merge-only mode.');
      }
    } else {
      // Get project ID
      const projectId = await getProjectId();
      
      // Fetch indexes
      await fetchIndexes(projectId);
      
      // Merge indexes
      const mergeSuccess = mergeIndexes();
      
      if (mergeSuccess) {
        // Deploy indexes if requested
        await deployIndexes(projectId);
      }
    }
  } catch (error) {
    console.error(`Error in index management process: ${error.message}`);
    process.exit(1);
  } finally {
    // Close readline interface
    rl.close();
  }
}

// Run the main function
main(); 