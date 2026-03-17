const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:        { type: String, required: true },
  avatarColor:     { type: String, default: '' },
  weeklyQuestions: { type: Number, default: 0 },
  totalQuestions:  { type: Number, default: 0 },
  weekStart:       { type: Date, default: () => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }},
}, { timestamps: true });

leaderboardSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);