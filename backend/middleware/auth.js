const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main authentication middleware (enhanced version)
const protect = async (req, res, next) => {
  let token;

  // Check multiple token sources (header, cookie, query)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Support cookie-based authentication
    token = req.cookies.token;
  } else if (req.query && req.query.token) {
    // Support query parameter (useful for WebSocket connections)
    token = req.query.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from token - support both 'id' and 'userId'
    const userId = decoded.id || decoded.userId;
    
    // Fetch user and exclude password
    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found - token may be invalid'
      });
    }

    // ✅ FIXED: Update last seen using findByIdAndUpdate instead of save()
    // This avoids validation errors when not all required fields are loaded
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

    // Set both req.user and req.userId for compatibility
    req.userId = req.user._id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Specific error handling
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired, please login again'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional middleware (if you add roles to User model)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (req.user.role && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
module.exports.default = protect;