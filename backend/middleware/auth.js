// backend/middleware/auth.js

const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  try {
    console.log("Session data in protect:", req.session); // Debugging

    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authorized, no session' });
    }

    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

// Authorize user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized` });
    }
    next();
  };
};

module.exports = { protect, authorize };
