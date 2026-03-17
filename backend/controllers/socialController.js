const StudyRoom   = require('../models/StudyRoom');
const Leaderboard = require('../models/Leaderboard');

// GET /api/social/rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await StudyRoom.find({ isActive: true })
      .populate('createdBy', 'displayName username avatarColor')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/social/rooms
const createRoom = async (req, res) => {
  try {
    const { name, subject } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Room name required' });
    const room = await StudyRoom.create({
      name,
      subject: subject || 'General',
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/social/rooms/:id/join
const joinRoom = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({ success: false, message: 'Room is full' });
    }
    if (!room.members.map(String).includes(String(req.user._id))) {
      room.members.push(req.user._id);
      await room.save();
    }
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/social/rooms/:id/message
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Message required' });
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    room.messages.push({
      userId:    req.user._id,           // ← store ObjectId so frontend can do left/right
      userName:  req.user.displayName || req.user.username,
      text,
      timestamp: new Date(),
    });

    // Keep last 100 messages
    if (room.messages.length > 100) room.messages = room.messages.slice(-100);
    await room.save();

    // Return last 50 messages so frontend always has latest
    res.json({ success: true, data: room.messages.slice(-50) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/social/rooms/:id/messages
const getMessages = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room.messages.slice(-50) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/social/rooms/:id/unread?since=<messageIndex>
// Returns count of messages after `since` index that are NOT from the requesting user
const getUnreadCount = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const since = parseInt(req.query.since) || 0;
    const messages = room.messages.slice(-50);
    const unread = messages.slice(since).filter(
      m => String(m.userId) !== String(req.user._id)
    ).length;

    res.json({ success: true, data: { unread, total: messages.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/social/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await StudyRoom.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/social/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const entries = await Leaderboard.find()
      .sort({ weeklyQuestions: -1 })
      .limit(10);
    res.json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/social/leaderboard/increment
const incrementScore = async (req, res) => {
  try {
    const user = req.user;
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    let entry = await Leaderboard.findOne({ userId: user._id });
    if (!entry) {
      entry = await Leaderboard.create({
        userId:          user._id,
        userName:        user.displayName || user.username,
        avatarColor:     user.avatarColor || '',
        weeklyQuestions: 1,
        totalQuestions:  1,
        weekStart,
      });
    } else {
      if (entry.weekStart < weekStart) {
        entry.weeklyQuestions = 0;
        entry.weekStart = weekStart;
      }
      entry.weeklyQuestions += 1;
      entry.totalQuestions  += 1;
      await entry.save();
    }
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getRooms, createRoom, joinRoom,
  sendMessage, getMessages, getUnreadCount,
  deleteRoom, getLeaderboard, incrementScore,
};