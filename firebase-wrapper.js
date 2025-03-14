#!/usr/bin/env node

/**
 * Firebase CLI wrapper script
 * 
 * This script intercepts Firebase CLI commands and ensures that Firestore rules
 * are properly synchronized before any deployment.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the arguments passed to the script
const args = process.argv.slice(2);

// Check if this is a deploy command
const isDeployCommand = args.includes('deploy');
const isFirestoreRulesOnly = args.includes('--only') && args.includes('firestore:rules');

// If this is a deploy command that includes Firestore rules
if (isDeployCommand && (!args.includes('--only') || isFirestoreRulesOnly || args.includes('firestore'))) {
  console.log('🔄 Intercepting Firebase deploy command...');
  console.log('🔄 Synchronizing Firestore rules before deployment...');
  
  try {
    // Run the sync-rules script
    if (process.platform === 'win32') {
      // On Windows, run the PowerShell script directly
      execSync('powershell -ExecutionPolicy Bypass -File firebase/fetch-and-merge-rules.ps1', {
        stdio: 'inherit'
      });
    } else {
      // On other platforms, run the npm script
      execSync('npm run sync-rules', {
        stdio: 'inherit'
      });
    }
    
    console.log('✅ Firestore rules synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing Firestore rules:', error.message);
    console.error('⚠️ Proceeding with deployment, but rules may not be properly synchronized.');
  }
}

// Pass the command to the real Firebase CLI
const firebaseBin = path.resolve('./node_modules/.bin/firebase');

if (fs.existsSync(firebaseBin)) {
  // If firebase is installed locally, use that
  const firebase = spawn(firebaseBin, args, { stdio: 'inherit' });
  
  firebase.on('close', (code) => {
    process.exit(code);
  });
} else {
  // Otherwise, try to use the global firebase
  const firebase = spawn('firebase', args, { stdio: 'inherit' });
  
  firebase.on('close', (code) => {
    process.exit(code);
  });
} 