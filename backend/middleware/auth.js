// backend/middleware/auth.js

const User = require('../models/User');

// Protect routes - Ensure session persistence
const protect = async (req, res, next) => {
  try {
    console.log("Session Data:", req.session); // Debugging session data

    // Check if user session exists
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authorized, no active session' });
    }

    // Fetch user data from session
    const user = await User.findById(req.session.user._id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Authorize user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };
