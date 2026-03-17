const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token (merged both versions)
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId, userId }, // Support both 'id' and 'userId' for compatibility
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' } // 30 days token validity
  );
};
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { 
      name, 
      username, 
      email, 
      password, 
      university, 
      semester, 
      course,
      displayName,
      bio,
      avatarColor
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    if (!name && !username) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name or username'
      });
    }

    // Check if user already exists (by email or username)
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        ...(username ? [{ username }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create user with all fields
    const user = await User.create({
      name: name || username,
      username: username || name.toLowerCase().replace(/\s+/g, ''),
      email,
      password,
      university: university || 'TMV University',
      semester: semester || 'Semester 6',
      course: course || 'BCA',
      displayName: displayName || name || username,
      bio: bio || '',
      avatarColor: avatarColor || undefined // Will use default if not provided
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password'
      });
    }

    if (!email && !username) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or username'
      });
    }

    // Find user by email or username (include password for comparison)
    const user = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : [])
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last seen using findByIdAndUpdate to avoid validation issues
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    // Support both req.user._id and req.userId for compatibility
    const userId = req.user?._id || req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ FIXED: Update last seen using findByIdAndUpdate
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

    res.status(200).json({
      success: true,
      data: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { 
      displayName, 
      bio, 
      avatar, 
      avatarColor,
      name,
      university,
      semester,
      course
    } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update object
    const updateData = {};
    if (displayName !== undefined) {
      updateData.displayName = displayName.trim() || user.username;
    }
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (bio !== undefined) {
      updateData.bio = bio.substring(0, 150);
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }
    if (avatarColor !== undefined) {
      updateData.avatarColor = avatarColor;
    }
    if (university !== undefined) {
      updateData.university = university;
    }
    if (semester !== undefined) {
      updateData.semester = semester;
    }
    if (course !== undefined) {
      updateData.course = course;
    }

    // FIXED: Use findByIdAndUpdate to avoid validation issues
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: error.message
    });
  }
};
// @desc    Delete user avatar
// @route   DELETE /api/auth/avatar
// @access  Private
exports.deleteAvatar = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.avatar = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      data: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// Export all functions
module.exports = {
  register: exports.register,
  login: exports.login,
  getCurrentUser: exports.getCurrentUser,
  updateProfile: exports.updateProfile,
  deleteAvatar: exports.deleteAvatar,
  changePassword: exports.changePassword,
};