const { execSync } = require('child_process');

// Replace this with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyAL8z2sJrayorYXAQXKo9DABIYLLhe-xis';

try {
  execSync(`firebase functions:config:set gemini.api_key="${GEMINI_API_KEY}"`);
  console.log('Successfully set Gemini API key in Firebase config');
} catch (error) {
  console.error('Error setting Gemini API key:', error);
}
