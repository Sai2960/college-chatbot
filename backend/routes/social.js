const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRooms, createRoom, joinRoom,
  sendMessage, getMessages, getUnreadCount,
  deleteRoom, getLeaderboard, incrementScore,
} = require('../controllers/socialController');

router.get('/rooms',                      protect, getRooms);
router.post('/rooms',                     protect, createRoom);
router.post('/rooms/:id/join',            protect, joinRoom);
router.post('/rooms/:id/message',         protect, sendMessage);
router.get('/rooms/:id/messages',         protect, getMessages);
router.get('/rooms/:id/unread',           protect, getUnreadCount);   // ← NEW
router.delete('/rooms/:id',              protect, deleteRoom);
router.get('/leaderboard',               protect, getLeaderboard);
router.post('/leaderboard/increment',    protect, incrementScore);

module.exports = router;