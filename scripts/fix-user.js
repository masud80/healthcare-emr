const { addMissingUser } = require('../src/utils/addMissingUser');

// Get email from command line argument
const email = process.argv[2] || 'masud80@hotmail.com';

addMissingUser(email)
  .then(() => console.log('User document created successfully'))
  .catch(error => console.error('Failed to create user document:', error));
