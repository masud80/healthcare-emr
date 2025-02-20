const { setAdminClaim } = require('../src/utils/setAdminClaim');

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  process.exit(1);
}

setAdminClaim(email)
  .then(() => {
    console.log('Admin claim set successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to set admin claim:', error);
    process.exit(1);
  });
