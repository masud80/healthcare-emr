

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createInterface } from 'readline';
import dotenv from 'dotenv';
import { google } from 'googleapis';


// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

// Configuration
const firestoreRulesPath = path.join(rootDir, 'firestore.rules');
const hospiceRulesPath = path.join(__dirname, 'last-deployed.rules');
const tempRulesFile = path.join(__dirname, 'temp_firebase_rules.rules');

// Parse command line arguments
const args = process.argv.slice(2);
const mergeOnly = args.includes('--merge-only');
const deployOnly = args.includes('--deploy-only');

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

/**
 * Main function to orchestrate the rules management process
 */
async function manageRules() {
  console.log('Starting Firestore Rules management process...');
  
  try {
    // Get project ID
    const projectId = await getProjectId();
    console.log(`Using Firebase project: ${projectId}`);
    
    // Step 1: Load latest rules
    await loadLatestRules(projectId);
    
    // Step 2: Apply git merge-file
    const mergeResult = execSync(`git merge-file -p ${path.join(rootDir, 'firestore.rules')} ${path.join(__dirname, 'last-deployed.rules')} ${path.join(__dirname, 'load-latest.rules')}`, { encoding: 'utf8' });
    //console.log('Merge result:', mergeResult);

    // Step 3: If no conflicts, clear last-deployed.rules and apply merged content
    if (!mergeResult.includes('<<<<<<<')) { // Check for conflict markers
      clearHospiceRules();
      fs.writeFileSync(hospiceRulesPath, mergeResult, 'utf8');
      clearFirestoreRules();
      fs.writeFileSync(firestoreRulesPath, mergeResult, 'utf8');

      console.log('Merged content applied to last-deployed.rules');
    } else {
      console.error('Merge conflicts detected. Please resolve them manually.');
    }

    // Ask if user wants to deploy rules
    if (!mergeOnly) {
      const shouldDeploy = await prompt('Do you want to deploy the merged rules to Firebase? (y/n): ');
      if (shouldDeploy.toLowerCase() === 'y') {
        await deployRules();
      }
    }
    
    console.log('Rules management process completed successfully!');
  } catch (error) {
    console.error('Error in rules management process:', error);
  } finally {
    rl.close();
  }
}

/**
 * Get the Firebase project ID from .env file or Firebase config
 */
async function getProjectId() {
  // Try to get project ID from .env file
  dotenv.config({ path: path.join(rootDir, '.env') });
  
  let projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID;
  
  if (projectId) {
    return projectId;
  }
  
  // If not found in .env, try to get from Firebase CLI
  try {
    const output = execSync('firebase use', { encoding: 'utf8' });
    const match = output.match(/(?:Using|Active) project ([^\s]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.warn('Could not get project ID from Firebase CLI:', error.message);
  }
  
  // If still not found, ask the user
  projectId = await prompt('Enter your Firebase project ID: ');
  return projectId;
}

/**
 * Fetch Firestore rules from Firebase using the Google APIs
 */
async function fetchFirestoreRules(projectId) {
  console.log('Fetching Firestore rules from Firebase...');
  
  try {
    // Try to use the Google APIs
    await fetchRulesWithGoogleAPI(projectId);
  } catch (apiError) {
    console.error('Error fetching rules with Google API:', apiError);
    console.error('Failed to fetch Firestore rules. Process will now exit.');
    process.exit(1);
  }
}

/**
 * Fetch Firestore rules using Google APIs
 */
async function fetchRulesWithGoogleAPI(projectId) {
  console.log('Using Google APIs to fetch Firestore rules...');
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(rootDir, "serviceAccountKey.json"), // Path to your service account key file
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const url = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;

    const res = await client.request({ url });
    console.log(`Found Firestore Rulesets for project ${projectId}`);

    const rulesets = res.data.rulesets;
    
    if (!rulesets || rulesets.length === 0) {
      console.error("❌ No Firestore rulesets found.");
      process.exit(1);
    }

    // Get the latest ruleset ID
    const latestRulesetId = rulesets[0].name.split("/").pop();
    console.log(`✅ Latest ruleset ID: ${latestRulesetId}`);

    // Fetch the latest ruleset
    const latestRulesUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets/${latestRulesetId}`;
    const latestRulesResponse = await client.request({ url: latestRulesUrl });

    // Extract the Firestore rules
    const rulesetData = latestRulesResponse.data;
    if (!rulesetData || !rulesetData.source || !rulesetData.source.files || rulesetData.source.files.length === 0) {
      console.error("❌ No Firestore rules found in the latest ruleset.");
      process.exit(1);
    }

    // Find the Firestore rules file
    const firestoreRulesFile = rulesetData.source.files.find(file => 
      file.name === 'firestore.rules' || file.name.includes('firestore')
    );
    
    if (!firestoreRulesFile) {
      console.error("❌ No Firestore rules file found in the ruleset.");
      process.exit(1);
    }

    // Write the rules to the temp file
    fs.writeFileSync(tempRulesFile, firestoreRulesFile.content, 'utf8');
    console.log(`✅ Successfully fetched Firestore rules and saved to: ${tempRulesFile}`);
    
  } catch (error) {
    console.error('Error in fetchRulesWithGoogleAPI:', error);
    throw error;
  }
}
 



/**
 * Deploy the merged rules to Firebase
 */
async function deployRules() {
  console.log('Deploying rules to Firebase...');
  
  try {
    execSync('firebase deploy --only firestore:rules', { 
      stdio: 'inherit' 
    });
    console.log('Successfully deployed rules to Firebase!');
  } catch (error) {
    console.error(`Error deploying rules: ${error.message}`);
    process.exit(1);
  }
}



// Step 1: Clear and load current Firebase rules into load-latest.rules
async function loadLatestRules(projectId) {
  console.log('Loading latest Firebase rules into load-latest.rules...');
  try {
    // Clear the content of load-latest.rules
    fs.writeFileSync(path.join(__dirname, 'load-latest.rules'), '', 'utf8');

    // Fetch the latest rules from Firebase
    await fetchFirestoreRules(projectId);

    // Copy the fetched rules to load-latest.rules
    const fetchedRules = fs.readFileSync(tempRulesFile, 'utf8');
    fs.writeFileSync(path.join(__dirname, 'load-latest.rules'), fetchedRules, 'utf8');
    console.log('Successfully loaded latest rules into load-latest.rules');
  } catch (error) {
    console.error('Error loading latest rules:', error);
    process.exit(1);
  }
}

// Step 2: Clear the content of hospice-rules.rules
function clearHospiceRules() {
  console.log('Clearing content of last-deployed.rules...');
  fs.writeFileSync(hospiceRulesPath, '', 'utf8');
  console.log('Cleared last-deployed.rules');
}

function clearFirestoreRules() {
  console.log('Clearing content of firestore.rules...');
  fs.writeFileSync(firestoreRulesPath, '', 'utf8');
  console.log('Cleared firestore.rules');
}


// Run the main function
manageRules().catch(console.error); 