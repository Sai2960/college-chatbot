const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  text:     { type: String, required: true },
  createdAt:{ type: Date, default: Date.now },
});

const studyRoomSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  subject:   { type: String, default: 'General' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages:  [messageSchema],
  isActive:  { type: Boolean, default: true },
  maxMembers:{ type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('StudyRoom', studyRoomSchema);