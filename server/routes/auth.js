const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if username and password match environment variables
    const validUsername = username === process.env.ADMIN_USERNAME;
    
    // Compare password with hashed password or plain text for simplicity
    // In a production environment, you should always use hashed passwords
    let validPassword = false;
    const envPass = process.env.ADMIN_PASSWORD;
    try {
      if (envPass && typeof envPass === 'string' && envPass.startsWith('$2')) {
        // If ADMIN_PASSWORD is a bcrypt hash, compare with bcryptjs
        validPassword = bcrypt.compareSync(password, envPass);
      } else {
        // Plain-text fallback
        validPassword = password === envPass;
      }
    } catch (e) {
      // Conservative fallback: only allow when plain-text matches
      validPassword = password === envPass;
    }
    
    if (!validUsername || !validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Create and assign a token
    const token = jwt.sign(
      { username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route (for client-side validation)
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true });
  } catch (error) {
    res.json({ valid: false });
  }
});

module.exports = router;