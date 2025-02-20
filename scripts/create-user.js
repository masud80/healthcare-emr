const { createUser } = require('../src/utils/createUser');

// Get user details from command line arguments
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];
const role = process.argv[5] || 'user';

if (!email || !password || !name) {
  console.error('Please provide email, password, and name as arguments');
  console.error('Usage: node create-user.js <email> <password> <name> [role]');
  process.exit(1);
}

const userData = {
  email,
  password,
  name,
  role
};

createUser(userData)
  .then((userRecord) => {
    console.log('Successfully created user:', userRecord.uid);
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to create user:', error);
    process.exit(1);
  });
