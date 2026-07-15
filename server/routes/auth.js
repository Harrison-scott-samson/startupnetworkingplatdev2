const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, bio: user.bio }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, avatar, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, avatar, role: role || 'founder', isVerified: true });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get me
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
