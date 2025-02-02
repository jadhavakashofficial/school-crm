const User = require('../models/User');

// ✅ Protect Middleware - Ensures User is Authenticated
const protect = async (req, res, next) => {
  console.log("🔍 Checking Session Data:", req.session); // Debugging session data

  if (!req.session.user) {
    return res.status(401).json({ message: "Not authorized, no active session" });
  }

  try {
    const user = await User.findById(req.session.user._id).select('-password');

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

// ✅ Authorize Middleware - Restricts Access Based on Role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };
