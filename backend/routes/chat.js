const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getChat,
  deleteChat,
  toggleBookmark,
  testGemini,
  testAI
} = require('../controllers/chatController');
const voiceController = require('../controllers/voiceController');
const { protect } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

// Test endpoints - Should be PUBLIC for easy testing
router.get('/test-gemini', testGemini);  // ✅ Public
router.get('/test-ai', testAI);          // ✅ Public (FIXED!)

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

// Voice chat endpoint
router.post('/voice', protect, voiceController.handleVoiceChat);

// Regular chat endpoints
router.post('/message', protect, sendMessage);
router.get('/history', protect, getChatHistory);
router.get('/:id', protect, getChat);
router.delete('/:id', protect, deleteChat);
router.put('/:id/bookmark', protect, toggleBookmark);

module.exports = router;