# Firestore Rules Management

This directory contains scripts and configuration for managing Firestore security rules across multiple applications sharing the same Firebase project.

## Overview

The hospice-emr application shares a Firebase project with the healthcare-emr application. To ensure that both applications' security rules coexist without conflicts, we've implemented a system to:

1. Fetch the current rules directly from Firebase
2. Extract the relevant parts from those rules
3. Merge them with our hospice-specific rules
4. Deploy the combined ruleset back to Firebase

## Directory Structure

- `rules/` - Contains individual rule files for each application
  - `shared-rules.rules` - Common rules shared between applications
  - `hospice-rules.rules` - Rules specific to the hospice-emr application
  - `manage-rules.mjs` - Node.js script to fetch, extract, merge, and deploy rules
- `indexes/` - Contains Firestore indexes management files
  - `manage-indexes.mjs` - Node.js script to manage Firestore indexes
  - `hospice-indexes.json` - Indexes specific to the hospice-emr application
  - `healthcare-indexes.json` - Indexes from the healthcare-emr application

## How to Use

### Managing Firestore Rules

To manage Firestore rules, use the `manage-rules.mjs` script:

```bash
# Install dependencies
npm install

# Fetch, merge, and optionally deploy rules
npm run manage-rules

# Only merge rules without fetching
npm run manage-rules -- --merge-only

# Only deploy existing merged rules
npm run manage-rules -- --deploy-only
```

The script will:
- Fetch the current rules directly from Firebase using the Google APIs
- Extract the relevant parts from those rules
- Merge the rules with the hospice-emr rules
- Optionally deploy the merged rules to Firebase

### Managing Firestore Indexes

To manage Firestore indexes, use the `manage-indexes.mjs` script:

```bash
# Fetch, merge, and optionally deploy indexes
npm run merge-indexes

# Only merge indexes without fetching
npm run merge-indexes -- --merge-only
```

### Automated Synchronization

The rules and indexes are automatically synchronized and deployed via GitHub Actions:

- On a daily schedule (midnight UTC)
- When changes are pushed to the `main` branch that affect Firestore rules or indexes
- Manually via the GitHub Actions workflow dispatch

## Modifying Rules

When modifying Firestore rules:

1. **DO NOT** edit the `firestore.rules` file directly
2. Instead, edit the appropriate file in the `rules/` directory:
   - For shared rules: `shared-rules.rules`
   - For hospice-specific rules: `hospice-rules.rules`
3. Run the synchronization script to merge and deploy the changes

## Troubleshooting

If you encounter issues with the synchronization process:

1. Ensure you're authenticated with Firebase CLI (`firebase login`)
2. Ensure Node.js is installed and available in your PATH
3. Verify that the rule files in the `rules/` directory are valid
4. Check the Firebase CLI is installed and authenticated

## GitHub Actions Configuration

For the GitHub Actions workflow to function properly, the following secrets must be configured:

- `FIREBASE_TOKEN` - Firebase CI token (generate with `firebase login:ci`)
- `FIREBASE_PROJECT_ID` - Firebase project ID

# Firebase Tools for Hospice EMR

This directory contains tools for managing Firebase Firestore rules and indexes for the Hospice EMR project.

## Setup

1. Install dependencies:
   ```
   npm run setup-firebase-admin
   ```

2. Set up authentication for the Firebase Admin SDK:

   **Option 1: Service Account Key (Recommended for local development)**
   
   1. Go to the Firebase console: https://console.firebase.google.com/
   2. Select your project
   3. Go to Project Settings > Service accounts
   4. Click "Generate new private key"
   5. Save the JSON file as `service-account-key.json` in this directory

   **Option 2: Application Default Credentials**
   
   1. Install the Google Cloud SDK
   2. Run: `gcloud auth application-default login`

## Fetching and Merging Firestore Rules

The `fetch-and-merge-rules.ps1` script fetches the current Firestore rules from Firebase using the Admin SDK, extracts them, and merges them with hospice-specific rules.

### Usage

```
npm run sync-rules
```

This will:
1. Fetch the current rules from Firebase using the Admin SDK
2. Extract the rules and save them to `firebase/rules/shared-rules.rules`
3. Merge the shared rules with hospice-specific rules from `firebase/rules/hospice-rules.rules`
4. Write the merged rules to `firestore.rules`
5. Optionally deploy the merged rules to Firebase

### How It Works

1. The script reads the project ID from the `.env` file or from Firebase configuration
2. It uses the Firebase Admin SDK to fetch the current rules
3. It extracts the rules content and saves it to a shared rules file
4. It merges the shared rules with hospice-specific rules, removing duplicates
5. It writes the merged rules to the output file

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Make sure you have a valid `service-account-key.json` file in this directory
2. Or make sure you're logged in with `gcloud auth application-default login`
3. Check that the service account has the necessary permissions

### Fetching Rules Fails

If fetching rules fails:

1. Check that the project ID is correct
2. Make sure the service account has the Security Rules Admin role
3. Try running the script with elevated permissions

## Manual Deployment

To manually deploy the rules:

```
npm run deploy-rules
``` 