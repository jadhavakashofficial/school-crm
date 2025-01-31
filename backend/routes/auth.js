
// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Signup Route
router.post('/signup', async (req, res, next) => {
  const { name, email, password, role, gender, contactNumber, profilePicture, salary } = req.body;

  try {
    // Create new user with plain text password
    const user = await User.create({
      name,
      email,
      password, // Storing plain text password (Not recommended for production)
      role,
      gender,
      profile: {
        contactNumber,
        profilePicture,
      },
      salary: role === 'teacher' ? salary : undefined, // Assign salary only if role is teacher
    });

    // Initialize session
    req.session.userId = user._id;
    req.session.role = user.role;

    // Respond with user data (excluding password)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      profile: user.profile,
      salary: user.salary,
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    next(error);
  }
});

// Login Route
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare plain text passwords
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Initialize session
    req.session.userId = user._id;
    req.session.role = user.role;

    // Respond with user data (excluding password)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      profile: user.profile,
      salary: user.salary,
    });
  } catch (error) {
    next(error);
  }
});

// Logout Route
router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out. Please try again.' });
    }
    res.clearCookie('connect.sid'); // Name might vary based on session configuration
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router; // Correctly export the router
