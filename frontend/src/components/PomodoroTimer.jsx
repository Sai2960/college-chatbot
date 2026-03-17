/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaRedo, FaCog, FaFire } from "react-icons/fa";

const MODES = [
  { id: "focus",      label: "Focus",       duration: 25, color: "from-violet-600 to-purple-600" },
  { id: "short",      label: "Short Break", duration: 5,  color: "from-green-500 to-emerald-600" },
  { id: "long",       label: "Long Break",  duration: 15, color: "from-blue-500 to-cyan-600"     },
];

export default function PomodoroTimer({ isDarkMode }) {
  const [modeIdx, setModeIdx]     = useState(0);
  const [seconds, setSeconds]     = useState(MODES[0].duration * 60);
  const [running, setRunning]     = useState(false);
  const [sessions, setSessions]   = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [customMins, setCustomMins] = useState(25);
  const intervalRef = useRef(null);
  const mode = MODES[modeIdx];

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const totalSeconds = mode.duration * 60;
  const progress     = ((totalSeconds - seconds) / totalSeconds) * 100;
  const mins  = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs  = String(seconds % 60).padStart(2, "0");

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (modeIdx === 0) setSessions(prev => prev + 1);
            new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3").play().catch(() => {});
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const switchMode = (idx) => {
    setModeIdx(idx);
    setSeconds(MODES[idx].duration * 60);
    setRunning(false);
  };

  const reset = () => { setSeconds(mode.duration * 60); setRunning(false); };

  const circumference = 2 * Math.PI * 90;
  const strokeDash    = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        {MODES.map((m, i) => (
          <motion.button key={m.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => switchMode(i)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              modeIdx === i
                ? `bg-gradient-to-r ${m.color} text-white shadow-lg`
                : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}>
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className={`${cardBg} border rounded-2xl p-6 flex flex-col items-center`}>
        <div className="relative w-52 h-52">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none"
              stroke={isDarkMode ? "#374151" : "#e5e7eb"} strokeWidth="8" />
            <circle cx="100" cy="100" r="90" fill="none"
              stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${textPrimary} font-mono`}>{mins}:{secs}</span>
            <span className={`text-xs mt-1 ${textMuted}`}>{mode.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={reset}
            className={`w-10 h-10 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} flex items-center justify-center ${textMuted}`}>
            <FaRedo className="text-sm" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setRunning(r => !r)}
            className={`w-20 h-14 rounded-2xl bg-gradient-to-r ${mode.color} text-white flex items-center justify-center shadow-lg`}>
            {running ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(s => !s)}
            className={`w-10 h-10 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} flex items-center justify-center ${textMuted}`}>
            <FaCog className="text-sm" />
          </motion.button>
        </div>

        {/* Sessions */}
        <div className="flex items-center gap-2 mt-3">
          <FaFire className="text-orange-400 text-sm" />
          <span className={`text-xs font-semibold ${textPrimary}`}>{sessions} sessions completed today</span>
        </div>

        {/* Session dots */}
        <div className="flex gap-1.5 mt-2">
          {Array.from({ length: Math.max(4, sessions) }, (_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < sessions ? "bg-orange-400" : isDarkMode ? "bg-gray-600" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className={`${cardBg} border rounded-2xl p-3`}>
        <p className={`text-xs font-semibold mb-1 ${textPrimary}`}>💡 Pomodoro Technique</p>
        <p className={`text-xs ${textMuted}`}>Work for 25 mins → 5 min break → Repeat 4 times → Take a 15 min long break</p>
      </div>
    </div>
  );
}