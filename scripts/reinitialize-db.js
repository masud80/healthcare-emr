const { initializeDatabase } = require('../src/utils/initializeTestData');
const path = require('path');

// Ensure we're in the right directory
process.chdir(path.join(__dirname, '..'));

console.log('Starting database reinitialization...');
initializeDatabase()
  .then(() => {
    console.log('Database reinitialization complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error reinitializing database:', error);
    process.exit(1);
  });
