const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
// Increased payload limit for voice/file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ─── Database Connection ──────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ─── Health Check Routes ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🎓 College Chatbot API is running!',
    status: 'active',
    timestamp: new Date(),
    features: {
      voice: 'enabled',
      ollama: 'ready',
      syllabus: 'enabled',
      assignments: 'enabled',
      study: 'enabled',
      quiz: 'enabled',
    },
    endpoints: {
      auth:        '/api/auth',
      chat:        '/api/chat',
      voice:       '/api/chat/voice',
      career:      '/api/career',
      syllabus:    '/api/syllabus',
      assignments: '/api/assignments',
      study:       '/api/study',
      quiz:        '/api/quiz',
    },
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working perfectly!',
    voice_enabled: true,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/chat',        require('./routes/chat'));
app.use('/api/career',      require('./routes/career'));

// New feature routes
app.use('/api/syllabus',    require('./routes/syllabus_fix'));
app.use('/api/assignments', require('./routes/assignment_fix'));
app.use('/api/study',       require('./routes/study_fix'));
app.use('/api/quiz',        require('./routes/quiz_fix'));
app.use('/api/social', require('./routes/social')); 

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 API ready at http://localhost:${PORT}/api`);
  console.log(`🎤 Voice endpoint: http://localhost:${PORT}/api/chat/voice`);
  console.log(`💡 Make sure Ollama is running: ollama serve`);
});
