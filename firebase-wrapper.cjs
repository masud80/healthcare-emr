#!/usr/bin/env node

/**
 * Firebase CLI wrapper script
 * 
 * This script intercepts Firebase CLI commands and ensures that Firestore rules
 * and indexes are properly synchronized before any deployment.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Try to read project ID from .env file
let projectId = null;
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const projectIdMatch = envContent.match(/VITE_FIREBASE_PROJECT_ID=(.+)/);
    if (projectIdMatch) {
      projectId = projectIdMatch[1].trim();
      console.log(`Using project ID from .env file: ${projectId}`);
    } else {
      const altMatch = envContent.match(/REACT_APP_FIREBASE_PROJECT_ID=(.+)/);
      if (altMatch) {
        projectId = altMatch[1].trim();
        console.log(`Using project ID from .env file: ${projectId}`);
      }
    }
  }
} catch (error) {
  console.error('Error reading project ID from .env file:', error.message);
}

// Get the arguments passed to the script
const args = process.argv.slice(2);

// Add project ID to args if not already specified
if (projectId && !args.includes('--project') && !args.some(arg => arg.startsWith('--project='))) {
  args.push('--project', projectId);
}

// Check if this is a deploy command
const isDeployCommand = args.includes('deploy');
const isFirestoreRulesOnly = args.includes('--only') && args.includes('firestore:rules');
const isFirestoreIndexesOnly = args.includes('--only') && args.includes('firestore:indexes');
const isFirestoreOnly = args.includes('--only') && args.includes('firestore');

// Check if we're being called from a sync script to prevent infinite recursion
const isCalledFromSync = process.env.FIREBASE_WRAPPER_SYNC === 'true';

// If this is a deploy command that includes Firestore rules
if (isDeployCommand && (!args.includes('--only') || isFirestoreRulesOnly || isFirestoreOnly)) {
  console.log('🔄 Intercepting Firebase deploy command...');
  console.log('🔄 Synchronizing Firestore rules before deployment...');
  
  try {
    // Use the new cross-platform JavaScript solution
    execSync('node firebase/rules/manage-rules.mjs --merge-only', {
      stdio: 'inherit'
    });
    
    console.log('✅ Firestore rules synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing Firestore rules:', error.message);
    console.error('⚠️ Proceeding with deployment, but rules may not be properly synchronized.');
  }
}

// If this is a deploy command that includes Firestore indexes and we're not in a recursive call
if (isDeployCommand && (!args.includes('--only') || isFirestoreIndexesOnly || isFirestoreOnly) && !isCalledFromSync) {
  console.log('🔄 Synchronizing Firestore indexes before deployment...');
  
  try {
    // Run the sync-indexes script using our new JavaScript solution
    console.log('Running index synchronization...');
    execSync('npm run sync-indexes', {
      stdio: 'inherit',
      env: { ...process.env, FIREBASE_WRAPPER_SYNC: 'true' }
    });
    
    console.log('✅ Firestore indexes synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing Firestore indexes:', error.message);
    console.error('⚠️ Proceeding with deployment, but indexes may not be properly synchronized.');
  }
}

// Check if we're in the root directory (where firebase.json is)
if (!fs.existsSync('firebase.json')) {
  console.error('❌ Error: Not in a Firebase app directory (could not locate firebase.json)');
  console.error('⚠️ Make sure you are running this command from the root directory of your project.');
  process.exit(1);
}

// Use the direct path to the Firebase CLI
const firebaseBin = 'C:\\Program Files\\nodejs\\firebase.cmd';

// Check if the Firebase CLI exists
if (fs.existsSync(firebaseBin)) {
  console.log('Using Firebase CLI at:', firebaseBin);
  const firebase = spawn(firebaseBin, args, { stdio: 'inherit' });
  
  firebase.on('close', (code) => {
    process.exit(code);
  });
} else {
  console.error('❌ Error: Firebase CLI not found at', firebaseBin);
  console.error('⚠️ Please install Firebase CLI globally using "npm install -g firebase-tools"');
  process.exit(1);
} 