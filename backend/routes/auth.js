const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ===================================
// PUBLIC ROUTES (No Authentication)
// ===================================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('/login', authController.login);

// ===================================
// PROTECTED ROUTES (Authentication Required)
// ===================================

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private
router.get('/me', protect, authController.getCurrentUser);

// Alternative route (alias for /me)
router.get('/profile', protect, authController.getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile (name, bio, avatar, university, etc.)
// @access  Private
router.put('/profile', protect, authController.updateProfile);

// @route   DELETE /api/auth/avatar
// @desc    Delete user avatar image
// @access  Private
router.delete('/avatar', protect, authController.deleteAvatar);

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', protect, authController.changePassword);

// ===================================
// OPTIONAL ROUTES (Add if needed)
// ===================================

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
  // Note: JWT tokens are stateless, so logout is handled client-side
  // This endpoint can be used for logging purposes
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   GET /api/auth/verify
// @desc    Verify if token is valid
// @access  Private
router.get('/verify', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: req.user.getPublicProfile()
  });
});

module.exports = router;