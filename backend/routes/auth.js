// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Helper: generate token
function generateToken(user) {
  // include minimal payload
  return jwt.sign({ id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * POST /api/auth/register
 * body: { name, username, email, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!password || (!username && !email)) {
      return res.status(400).json({ message: 'Provide password and username or email' });
    }

    // Check unique username/email
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(409).json({ message: 'Username already taken' });
    }
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      username,
      email,
      passwordHash,
    });

    await user.save();

    const token = generateToken(user);

    return res.status(201).json({ message: 'User created', token });
  } catch (err) {
    console.error('Register error:', err);
    // Mongoose validation error -> send friendly message
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: err.errors });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 * body: { identifier, password }  // identifier can be username or email
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Provide identifier and password' });

    // Try find by username then email
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
