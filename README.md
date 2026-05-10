# TMV College AI — AI-Powered Student Assistant Platform

A full-stack AI web application built specifically for students of TMV University. One platform for everything — chat with AI, generate quizzes, track assignments, plan studies, debug code, and much more.

**Live Demo:** [https://preeminent-torrone-ae055a.netlify.app](https://preeminent-torrone-ae055a.netlify.app)

**Stack:** React · Tailwind CSS · Framer Motion · Node.js · Express · MongoDB · Groq API (LLaMA 3.3 70B) · Google Gemini · JWT · Socket.io · Netlify

---

## The Problem It Solves

College students today open multiple apps for different needs — one for assignments, one for study planning, one for quizzes, one for career help. **TMV College AI brings everything into one single AI-powered platform**, so students never have to switch between tools again.

---

## AI Architecture

The AI system is built for reliability and context-awareness:

```
Student sends message
        ↓
Backend receives message + last 10 messages as context
        ↓
System prompt instructs AI to focus on:
education, programming, career, exams, Indian job market
        ↓
Request sent to Groq API (LLaMA 3.3 70B)
        ↓
If Groq fails → Google Gemini automatically takes over
        ↓
Reply streams to frontend with live typing animation ✅
```

- **Primary AI:** Groq API with LLaMA 3.3 70B (large, fast, powerful)
- **Fallback AI:** Google Gemini (automatic — student never sees an error)
- **Context window:** Last 10 messages passed as history so AI remembers the conversation
- **Focus:** Education-only system prompt — programming, career, exams, Indian job market

---

## Features

### AI Chatbot
- Ask any academic, programming, or career question
- Live typing animation for AI responses
- Chat history saved in MongoDB
- Bookmark important chats
- Export any chat as PDF
- Context-aware — remembers last 10 messages

### 15 Built-in Study Tools

| Tool | Description |
| --- | --- |
| Syllabus Q&A | Ask questions about your syllabus topics |
| Quiz Generator | AI-generated quizzes on any subject |
| Notes Summarizer | Paste notes, get a clean AI summary |
| Assignment Tracker | Create, manage, and track assignments with deadlines |
| Study Planner | Plan your study schedule with AI assistance |
| Pomodoro Timer | Focused study sessions with timed breaks |
| GPA Calculator | Calculate and track your GPA |
| Attendance Tracker | Monitor your attendance percentage |
| Code Debugger | Paste code, get bugs explained and fixed |
| Essay Writer | AI-assisted essay writing for assignments |
| Flashcard Generator | Auto-generate flashcards for revision |
| Career Tools | Career guidance for Indian job market |
| Social Features | Connect and interact with fellow students |
| Timetable Builder | Build and manage your class timetable |
| Study Dashboard | Overview of your progress across all tools |

### User System
- Full login and register with JWT authentication
- Protected routes — only logged-in users can access tools
- User profile with course, semester, university, and custom avatar
- Dark mode and light mode toggle
- Fully mobile responsive design

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js, Tailwind CSS, Framer Motion |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Primary AI | Groq API — LLaMA 3.3 70B |
| Fallback AI | Google Gemini |
| Auth | JWT (JSON Web Tokens) |
| Real-time | Socket.io |
| Animations | Framer Motion |
| Deployment | Netlify (frontend) |

---

## Project Structure

```
college-chatbot/
├── backend/
│   ├── config/                     # DB and environment config
│   ├── controllers/
│   │   ├── authController.js       # Register, login, JWT
│   │   ├── chatController.js       # Chat save/retrieve
│   │   ├── GroqController.js       # Groq AI + Gemini fallback
│   │   ├── quizController.js       # Quiz generation
│   │   ├── assignmentController.js # Assignment CRUD
│   │   ├── careerController.js     # Career guidance
│   │   ├── studyController.js      # Study planner & notes
│   │   ├── syllabusController.js   # Syllabus Q&A
│   │   ├── socialController.js     # Social features
│   │   └── voiceController.js      # Voice input handling
│   ├── middleware/
│   │   └── auth.js                 # JWT verification middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Chat.js
│   │   ├── Assignment.js
│   │   ├── CourseData.js
│   │   ├── Leaderboard.js
│   │   └── StudyRoom.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── Quiz.js
│   │   ├── Assignment.js
│   │   ├── career.js
│   │   ├── Study.js
│   │   └── Syllabus.js
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssignmentTracker.jsx
│   │   │   ├── AttendanceTracker.jsx
│   │   │   ├── CareerTools.jsx
│   │   │   ├── CodeDebugger.jsx
│   │   │   ├── EssayWriter.jsx
│   │   │   ├── FlashcardGenerator.jsx
│   │   │   ├── GPACalculator.jsx
│   │   │   ├── NotesSummarizer.jsx
│   │   │   ├── PomodoroTimer.jsx
│   │   │   ├── QuizGenerator.jsx
│   │   │   ├── SocialFeatures.jsx
│   │   │   ├── VoiceRecorder.jsx
│   │   │   ├── HistoryPanel.jsx
│   │   │   ├── ProfileEditor.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── WelcomeScreen.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── App.jsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Groq API key — free at [console.groq.com](https://console.groq.com)
- Google Gemini API key — free at [aistudio.google.com](https://aistudio.google.com)

### Installation

```bash
git clone https://github.com/Sai2960/college-chatbot.git
cd college-chatbot
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Routes

| Route | Method | Description |
| --- | --- | --- |
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login, returns JWT token |
| `/api/chat` | POST | Send message to AI |
| `/api/chat/history` | GET | Get saved chat history |
| `/api/chat/bookmark` | POST | Bookmark a chat |
| `/api/chat/export` | GET | Export chat as PDF |
| `/api/quiz/generate` | POST | Generate AI quiz |
| `/api/quiz/leaderboard` | GET | Get quiz leaderboard |
| `/api/assignment` | GET/POST | Manage assignments |
| `/api/career` | POST | Career guidance query |
| `/api/study` | POST | Notes summarization |
| `/api/syllabus` | GET | Syllabus Q&A |

---

## Key Highlights for Recruiters

- **Dual AI system** — Groq (LLaMA 3.3 70B) as primary, Google Gemini as automatic fallback
- **Context-aware AI** — passes last 10 messages so the AI remembers the full conversation
- **Education-focused system prompt** — AI stays on topic: academics, career, Indian job market
- **15 real student tools** — not just a chatbot, a complete study platform
- **PDF export** — students can download any chat conversation
- **JWT protected routes** — secure authentication throughout
- **Dark/light mode** — full theme support
- **Mobile responsive** — works on all screen sizes
- **Framer Motion animations** — smooth, professional UI

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with React · Node.js · Groq LLaMA 3.3 70B · Google Gemini · Deployed on Netlify*
