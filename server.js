const express = require('express');
const cors = require('cors');
const { createUser } = require('./src/utils/createUser');

const app = express();
app.use(cors());
app.use(express.json());

// Create user endpoint
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const userRecord = await createUser({ email, password, name, role });
    res.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create user' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
