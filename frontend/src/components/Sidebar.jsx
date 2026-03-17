/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/static-components */
// Sidebar.jsx - MERGED PREMIUM MOBILE RESPONSIVE VERSION
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaBookmark,
  FaRegBookmark,
  FaSignOutAlt,
  FaUser,
  FaRobot,
  FaEllipsisV,
  FaCog,
  FaDoorOpen,
  FaBell,
  FaGlobe,
  FaLock,
  FaPalette,
  FaCamera,
  FaTimes,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaStar,
  FaClock,
  FaGraduationCap,
  FaUniversity,
  FaEdit,
  FaFilePdf,
  FaCalendarAlt,
  FaBrain,
  FaStickyNote,
  FaClipboardList,
  FaBriefcase,
  FaUsers,
  FaChartBar,
  FaChartLine,
  FaCode,
  FaCheckCircle,
  FaFileAlt,
} from "react-icons/fa";
import { HiOutlineSun, HiOutlineMoon, HiSparkles } from "react-icons/hi";


// ─── Feature Panel imports ────────────────────────────────────
import SyllabusUploader from "./SyllabusUploader";
import AssignmentTracker from "./AssignmentTracker";
import StudyPlanner from "./StudyPlanner";
import QuizGenerator from "./QuizGenerator";
import NotesSummarizer from "./NotesSummarizer";
import CareerTools from "./CareerTools";
import SocialFeatures from "./SocialFeatures";
// Add these imports at the top
import PomodoroTimer from "./PomodoroTimer";
import GPACalculator from "./GPACalculator";
import FlashcardGenerator from "./FlashcardGenerator";
import CodeDebugger from "./CodeDebugger";
import StudyDashboard from "./StudyDashboard";
import AttendanceTracker from "./AttendanceTracker";
import EssayWriter from "./EssayWriter";
import TimetableBuilder from "./TimetableBuilder";

// Theme Context
const ThemeContext = React.createContext();

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme-aware styles
const getThemeStyles = (isDarkMode) => ({
  bgPrimary: isDarkMode
    ? "bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900"
    : "bg-gradient-to-b from-gray-50 via-white to-gray-100",
  bgSecondary: isDarkMode ? "bg-gray-800" : "bg-white",
  bgTertiary: isDarkMode ? "bg-gray-700" : "bg-gray-100",
  bgHover: isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200",
  bgCard: isDarkMode
    ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80"
    : "bg-gradient-to-br from-white to-gray-50",
  bgInput: isDarkMode ? "bg-gray-700" : "bg-gray-100",
  bgModal: isDarkMode
    ? "bg-gradient-to-br from-gray-900 to-gray-800"
    : "bg-gradient-to-br from-white to-gray-50",
  textPrimary: isDarkMode ? "text-white" : "text-gray-900",
  textSecondary: isDarkMode ? "text-gray-300" : "text-gray-600",
  textTertiary: isDarkMode ? "text-gray-400" : "text-gray-500",
  textMuted: isDarkMode ? "text-gray-500" : "text-gray-400",
  borderColor: isDarkMode ? "border-gray-700" : "border-gray-200",
  borderColorLight: isDarkMode ? "border-gray-600" : "border-gray-300",
  shadow: isDarkMode
    ? "shadow-2xl shadow-black/20"
    : "shadow-xl shadow-gray-200/50",
  shadowLg: isDarkMode
    ? "shadow-2xl shadow-black/30"
    : "shadow-2xl shadow-gray-300/50",
});

// ─── Feature Panel Definitions ───────────────────────────────
const FEATURE_TABS = [
  { id: "syllabus", label: "Syllabus Q&A", icon: FaFilePdf, color: "text-red-400" },
  { id: "assignments", label: "Assignments", icon: FaClipboardList, color: "text-blue-400" },
  { id: "study", label: "Study Planner", icon: FaCalendarAlt, color: "text-green-400" },
  { id: "quiz", label: "Quiz Generator", icon: FaBrain, color: "text-purple-400" },
  { id: "notes", label: "Notes Summarizer", icon: FaStickyNote, color: "text-yellow-400" },
  { id: "career", label: "Career Tools", icon: FaBriefcase, color: "text-orange-400" }, // ← NEW
  { id: "social", label: "Social", icon: FaUsers, color: "text-pink-400" },
  { id: "pomodoro", label: "Pomodoro", icon: FaClock, color: "text-red-400" },
  { id: "gpa", label: "GPA Calc", icon: FaChartBar, color: "text-blue-400" },
  { id: "flashcards", label: "Flashcards", icon: FaBrain, color: "text-pink-400" },
  { id: "debugger", label: "Debugger", icon: FaCode, color: "text-green-400" },
  { id: "dashboard", label: "Dashboard", icon: FaChartLine, color: "text-cyan-400" },
  { id: "attendance", label: "Attendance", icon: FaCheckCircle, color: "text-yellow-400" },
  { id: "essay", label: "Essay AI", icon: FaFileAlt, color: "text-indigo-400" },
  { id: "timetable", label: "Timetable", icon: FaCalendarAlt, color: "text-orange-400" },
];

// ─── FeaturePanel: exported so Chat.jsx can use it ───────────
export function FeaturePanel({ isDarkMode, onClose }) {
  const [activeTab, setActiveTab] = useState("syllabus");
  const styles = getThemeStyles(isDarkMode);

  const panelContent = {
    syllabus: <SyllabusUploader isDarkMode={isDarkMode} />,
    assignments: <AssignmentTracker isDarkMode={isDarkMode} />,
    study: <StudyPlanner isDarkMode={isDarkMode} />,
    quiz: <QuizGenerator isDarkMode={isDarkMode} />,
    notes: <NotesSummarizer isDarkMode={isDarkMode} />,
    career: <CareerTools isDarkMode={isDarkMode} />,  // ← NEW
    social: <SocialFeatures isDarkMode={isDarkMode} />,  // ← NEW
    // Add these to panelContent object
    pomodoro: <PomodoroTimer isDarkMode={isDarkMode} />,
    gpa: <GPACalculator isDarkMode={isDarkMode} />,
    flashcards: <FlashcardGenerator isDarkMode={isDarkMode} />,
    debugger: <CodeDebugger isDarkMode={isDarkMode} />,
    dashboard: <StudyDashboard isDarkMode={isDarkMode} />,
    attendance: <AttendanceTracker isDarkMode={isDarkMode} />,
    essay: <EssayWriter isDarkMode={isDarkMode} />,
    timetable: <TimetableBuilder isDarkMode={isDarkMode} />,
  };

  const active = FEATURE_TABS.find((t) => t.id === activeTab);

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`
  w-full h-full flex flex-col
  ${styles.bgPrimary}
  border-r ${styles.borderColor}
`}

    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-700/50 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              {active && <active.icon className="text-sm" />}
              <span>{active?.label}</span>
            </h2>
            <p className="text-xs text-white/70">AI-powered college tools</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-xl transition-all border border-white/30"
          >
            <FaTimes />
          </motion.button>
        </div>
      </div>

      {/* Feature Tab Switcher */}
      <div className={`flex gap-1 p-2 border-b ${styles.borderColor} flex-shrink-0 overflow-x-auto`}>
        {FEATURE_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`flex-shrink-0 p-2 rounded-xl transition-all ${activeTab === tab.id
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
              : isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
              }`}
          >
            <tab.icon className="text-sm" />
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {panelContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────
function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, isDarkMode }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState("appearance");
  const styles = getThemeStyles(isDarkMode);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const tabs = [
    { id: "appearance", label: "Appearance", icon: FaPalette },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "privacy", label: "Privacy", icon: FaLock },
    { id: "language", label: "Language", icon: FaGlobe },
  ];

  if (!isOpen) return null;

  const ToggleSwitch = ({ enabled, onChange, color = "blue" }) => (
    <button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${enabled
        ? `bg-gradient-to-r from-${color}-500 to-${color}-600`
        : isDarkMode ? "bg-gray-600" : "bg-gray-300"
        }`}
    >
      <motion.div
        animate={{ x: enabled ? 28 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
      />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`${styles.bgModal} rounded-2xl md:rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden ${styles.shadowLg} border ${styles.borderColor}`}
      >
        {/* Header */}
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-700/50 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <FaCog className="text-white text-base md:text-lg" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">Settings</h2>
                <p className="text-xs text-white/70 hidden sm:block">Customize your experience</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-lg md:rounded-xl transition-all"
            >
              <FaTimes className="text-base md:text-lg" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(85vh-180px)]">
          {/* Sidebar Tabs */}
          <div className={`w-full md:w-48 ${isDarkMode ? "bg-gray-800/50" : "bg-gray-100/50"} p-2 md:p-3 border-b md:border-b-0 md:border-r ${styles.borderColor} overflow-x-auto md:overflow-x-visible`}>
            <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-0 min-w-max md:min-w-0">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl mb-0 md:mb-2 transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    : `${styles.textSecondary} ${styles.bgHover}`
                    }`}
                >
                  <tab.icon className={`text-sm md:text-base ${activeTab === tab.id ? "text-white" : "text-purple-400"}`} />
                  <span className="text-xs md:text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "appearance" && (
                <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 md:space-y-6">
                  <div className={`${styles.bgCard} rounded-xl md:rounded-2xl p-4 md:p-5 border ${styles.borderColor} backdrop-blur-lg`}>
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        {isDarkMode ? <HiOutlineMoon className="text-xl md:text-2xl text-purple-400" /> : <HiOutlineSun className="text-xl md:text-2xl text-yellow-500" />}
                        <div>
                          <label className={`text-xs md:text-sm font-semibold ${styles.textPrimary}`}>Theme Mode</label>
                          <p className={`text-xs ${styles.textMuted} hidden sm:block`}>Switch between dark and light</p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={localSettings.darkMode} onChange={() => setLocalSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))} color="purple" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <HiSparkles className="text-xl md:text-2xl text-cyan-400" />
                        <div>
                          <label className={`text-xs md:text-sm font-semibold ${styles.textPrimary}`}>Compact Mode</label>
                          <p className={`text-xs ${styles.textMuted} hidden sm:block`}>Reduce spacing in UI</p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={localSettings.compactMode} onChange={() => setLocalSettings((prev) => ({ ...prev, compactMode: !prev.compactMode }))} color="cyan" />
                    </div>
                  </div>
                  <div className={`${styles.bgCard} rounded-xl md:rounded-2xl p-4 md:p-5 border ${styles.borderColor}`}>
                    <h4 className={`text-xs md:text-sm font-semibold ${styles.textPrimary} mb-3 md:mb-4`}>Theme Preview</h4>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} onClick={() => setLocalSettings((prev) => ({ ...prev, darkMode: true }))}
                        className={`p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-all ${localSettings.darkMode ? "ring-2 ring-purple-500 bg-gray-800" : "bg-gray-800"}`}
                      >
                        <div className="h-12 md:h-16 bg-gray-900 rounded-lg mb-2 flex items-center justify-center">
                          <HiOutlineMoon className="text-purple-400 text-xl md:text-2xl" />
                        </div>
                        <p className="text-xs text-center text-gray-300 font-medium">Dark Mode</p>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} onClick={() => setLocalSettings((prev) => ({ ...prev, darkMode: false }))}
                        className={`p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-all ${!localSettings.darkMode ? "ring-2 ring-purple-500 bg-white" : "bg-white"}`}
                      >
                        <div className="h-12 md:h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                          <HiOutlineSun className="text-yellow-500 text-xl md:text-2xl" />
                        </div>
                        <p className="text-xs text-center text-gray-700 font-medium">Light Mode</p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className={`${styles.bgCard} rounded-xl md:rounded-2xl p-4 md:p-5 border ${styles.borderColor} space-y-4 md:space-y-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <FaBell className="text-lg md:text-xl text-yellow-400" />
                        <div>
                          <label className={`text-xs md:text-sm font-semibold ${styles.textPrimary}`}>Desktop Notifications</label>
                          <p className={`text-xs ${styles.textMuted} hidden sm:block`}>Get notified on new messages</p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={localSettings.notifications} onChange={() => setLocalSettings((prev) => ({ ...prev, notifications: !prev.notifications }))} color="yellow" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <span className="text-lg md:text-xl">🔊</span>
                        <div>
                          <label className={`text-xs md:text-sm font-semibold ${styles.textPrimary}`}>Sound Effects</label>
                          <p className={`text-xs ${styles.textMuted} hidden sm:block`}>Play sounds for actions</p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={localSettings.soundEffects} onChange={() => setLocalSettings((prev) => ({ ...prev, soundEffects: !prev.soundEffects }))} color="orange" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "privacy" && (
                <motion.div key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className={`${styles.bgCard} rounded-xl md:rounded-2xl p-4 md:p-5 border ${styles.borderColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <FaLock className="text-lg md:text-xl text-green-400" />
                        <div>
                          <label className={`text-xs md:text-sm font-semibold ${styles.textPrimary}`}>Save Chat History</label>
                          <p className={`text-xs ${styles.textMuted} hidden sm:block`}>Keep your conversations saved</p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={localSettings.saveHistory} onChange={() => setLocalSettings((prev) => ({ ...prev, saveHistory: !prev.saveHistory }))} color="green" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "language" && (
                <motion.div key="language" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className={`${styles.bgCard} rounded-xl md:rounded-2xl p-4 md:p-5 border ${styles.borderColor}`}>
                    <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                      <FaGlobe className="text-lg md:text-xl text-blue-400" />
                      <label className={`text-xs md:text-sm font-semibold ${styles.textPrimary}`}>Language & Region</label>
                    </div>
                    <select value={localSettings.language} onChange={(e) => setLocalSettings((prev) => ({ ...prev, language: e.target.value }))}
                      className={`w-full ${styles.bgInput} ${styles.textPrimary} px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${styles.borderColor} focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm`}
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Spanish</option>
                      <option value="fr">🇫🇷 French</option>
                      <option value="de">🇩🇪 German</option>
                      <option value="hi">🇮🇳 Hindi</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 md:px-6 py-3 md:py-4 border-t ${styles.borderColor} ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"} flex justify-end space-x-2 md:space-x-3`}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className={`px-4 md:px-6 py-2 md:py-2.5 ${styles.bgTertiary} ${styles.bgHover} ${styles.textPrimary} rounded-lg md:rounded-xl transition-all font-medium text-sm`}
          >
            Cancel
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg md:rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25 text-sm"
          >
            <span className="flex items-center space-x-2">
              <FaCheck className="text-sm" /><span>Save Changes</span>
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Profile Editor ───────────────────────────────────────────
function ProfileEditor({ user, onClose, onUpdate, isDarkMode }) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
  const [course, setCourse] = useState(user?.course || "BCA");
  const [semester, setSemester] = useState(user?.semester || "Semester 6");
  const [university, setUniversity] = useState(user?.university || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const styles = getThemeStyles(isDarkMode);

  const predefinedGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
    "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
    "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    "linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)",
    "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)",
  ];

  const courses = ["BCA", "MCA", "B.Tech", "M.Tech", "B.Sc. IT", "M.Sc. IT"];

  const getSemesterCount = (courseName) => {
    const semesterMap = { BCA: 6, MCA: 4, "B.Tech": 8, "M.Tech": 4, "B.Sc. IT": 6, "M.Sc. IT": 4 };
    return semesterMap[courseName] || 6;
  };

  const [maxSemesters, setMaxSemesters] = useState(getSemesterCount(course));

  useEffect(() => {
    const newMax = getSemesterCount(course);
    setMaxSemesters(newMax);
    const currentSem = parseInt(semester.split(" ")[1]);
    if (currentSem > newMax) setSemester(`Semester ${newMax}`);
  }, [course, semester]);

  const semesters = Array.from({ length: maxSemesters }, (_, i) => `Semester ${i + 1}`);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert("Image size should be less than 5MB"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put("/api/auth/profile", {
        displayName: displayName.trim(), bio: bio.trim(), avatar, avatarColor, course, semester, university: university.trim(),
      });
      if (response.data.success) { onUpdate(response.data.data); onClose(); }
      else alert(response.data.message || "Failed to update profile");
    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally { setIsLoading(false); }
  };

  const getInitials = () => {
    const name = displayName || user?.username || "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`${styles.bgModal} rounded-2xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden ${styles.shadowLg} border ${styles.borderColor}`}
      >
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-700/50 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <FaUser className="text-white text-base md:text-lg" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">Edit Profile</h2>
                <p className="text-xs text-white/70 hidden sm:block">Personalize your account</p>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-lg md:rounded-xl transition-all"
            >
              <FaTimes className="text-base md:text-lg" />
            </motion.button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4 md:space-y-6">
          <div className="flex flex-col items-center space-y-3 md:space-y-4">
            <div className="relative group">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-purple-500/50 shadow-xl" />
                ) : (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-xl border-4 border-white/20" style={{ background: avatarColor }}>
                    {getInitials()}
                  </div>
                )}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 md:w-10 md:h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-gray-900"
                >
                  <FaCamera className="text-xs md:text-sm" />
                </motion.button>
              </motion.div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            {avatar && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setAvatar(null)}
                className="text-xs md:text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Remove Photo
              </motion.button>
            )}
            {!avatar && (
              <div className="w-full">
                <label className={`text-xs font-medium ${styles.textSecondary} block mb-2 md:mb-3 text-center`}>Choose Avatar Style</label>
                <div className="grid grid-cols-6 gap-1.5 md:gap-2">
                  {predefinedGradients.map((gradient, idx) => (
                    <motion.button key={idx} whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => setAvatarColor(gradient)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl shadow-md transition-all ${avatarColor === gradient ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900" : ""}`}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 md:space-y-4">
            <div>
              <label className={`text-xs md:text-sm font-medium ${styles.textSecondary} mb-1.5 md:mb-2 flex items-center space-x-2`}>
                <FaUser className="text-purple-400 text-xs md:text-sm" /><span>Display Name</span>
              </label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" maxLength={50}
                className={`w-full ${styles.bgInput} ${styles.textPrimary} px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${styles.borderColor} focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm`}
              />
            </div>
            <div>
              <label className={`text-xs md:text-sm font-medium ${styles.textSecondary} mb-1.5 md:mb-2 flex items-center space-x-2`}>
                <FaEdit className="text-blue-400 text-xs md:text-sm" /><span>Bio</span>
              </label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={200} rows={3}
                className={`w-full ${styles.bgInput} ${styles.textPrimary} px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${styles.borderColor} focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none text-sm`}
              />
              <p className={`text-xs ${styles.textMuted} text-right mt-1`}>{bio.length}/200 characters</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className={`text-xs md:text-sm font-medium ${styles.textSecondary} mb-1.5 md:mb-2 flex items-center space-x-2`}>
                  <FaGraduationCap className="text-green-400 text-xs md:text-sm" /><span>Course</span>
                </label>
                <select value={course} onChange={(e) => setCourse(e.target.value)}
                  className={`w-full ${styles.bgInput} ${styles.textPrimary} px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${styles.borderColor} focus:border-purple-500 focus:outline-none transition-all text-sm`}
                >
                  {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={`text-xs md:text-sm font-medium ${styles.textSecondary} mb-1.5 md:mb-2 flex items-center space-x-2`}>
                  <FaClock className="text-yellow-400 text-xs md:text-sm" /><span>Semester</span>
                </label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)}
                  className={`w-full ${styles.bgInput} ${styles.textPrimary} px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${styles.borderColor} focus:border-purple-500 focus:outline-none transition-all text-sm`}
                >
                  {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={`text-xs md:text-sm font-medium ${styles.textSecondary} mb-1.5 md:mb-2 flex items-center space-x-2`}>
                <FaUniversity className="text-red-400 text-xs md:text-sm" /><span>University</span>
              </label>
              <input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="Your university name"
                className={`w-full ${styles.bgInput} ${styles.textPrimary} px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${styles.borderColor} focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm`}
              />
            </div>
          </div>
        </form>

        <div className={`px-4 md:px-6 py-3 md:py-4 border-t ${styles.borderColor} ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"} flex justify-end space-x-2 md:space-x-3`}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={onClose} disabled={isLoading}
            className={`px-4 md:px-6 py-2 md:py-2.5 ${styles.bgTertiary} ${styles.bgHover} ${styles.textPrimary} rounded-lg md:rounded-xl transition-all font-medium text-sm`}
          >
            Cancel
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={isLoading}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg md:rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25 disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2"><FaCheck className="text-sm" /><span>Save Profile</span></span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Sidebar Component ───────────────────────────────────
function Sidebar({
  isOpen, onToggle, chats = [], currentChat, onChatSelect,
  onNewChat, onDeleteChat, onToggleBookmark, user, onLogout,
  onUpdateUser, darkMode, onToggleDarkMode,
}) {
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState({
    darkMode: darkMode ?? true,
    compactMode: false,
    notifications: true,
    soundEffects: false,
    saveHistory: true,
    language: "en",
  });

  useEffect(() => { setSettings((prev) => ({ ...prev, darkMode })); }, [darkMode]);

  const isDarkMode = darkMode;
  const styles = getThemeStyles(isDarkMode);

  const getInitials = () => {
    const name = user?.displayName || user?.name || user?.username || "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredChats = chats.filter((chat) => chat.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const bookmarkedChats = filteredChats.filter((chat) => chat.bookmarked);
  const recentChats = filteredChats.filter((chat) => !chat.bookmarked);

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    if (newSettings.darkMode !== darkMode) onToggleDarkMode();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onToggle} />}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed md:relative left-0 top-0 w-80 h-full ${styles.bgPrimary} border-r ${styles.borderColor} flex flex-col ${styles.shadowLg} z-50`}
          >
            {/* Premium Header */}
            <div className="p-4 md:p-5 border-b border-gray-700/50 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-white shadow-xl border border-white/30">
                    <FaRobot className="text-xl md:text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-white text-base md:text-lg tracking-tight truncate">College AI</h2>
                    <p className="text-xs text-white/70 flex items-center space-x-1">
                      <HiSparkles className="text-yellow-300 flex-shrink-0" />
                      <span className="truncate">Your Study Assistant</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(true)}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/30"
                    >
                      <FaCog className="text-base md:text-lg" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onToggle}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/30"
                    >
                      <FaChevronLeft className="text-base md:text-lg" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 md:p-4 border-b border-gray-700/30">
              <div className={`relative ${styles.bgInput} rounded-xl overflow-hidden`}>
                <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.textMuted} text-sm`} />
                <input type="text" placeholder="Search conversations..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${styles.bgInput} ${styles.textPrimary} pl-9 pr-3 py-2.5 md:py-3 text-sm focus:outline-none`}
                />
              </div>
            </div>

            {/* New Chat */}
            <div className="px-3 md:px-4 pt-3 md:pt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { onNewChat(); setSearchQuery(""); }}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2.5 md:py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25 font-semibold text-sm md:text-base"
              >
                <FaPlus className="text-base md:text-lg" /><span>New Chat</span>
              </motion.button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 custom-scrollbar">
              {!chats || chats.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${styles.bgTertiary} rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                    <FaRobot className={`text-3xl md:text-4xl ${styles.textMuted}`} />
                  </div>
                  <p className={`text-xs md:text-sm font-medium ${styles.textSecondary}`}>No conversations yet</p>
                  <p className={`text-xs mt-1 md:mt-2 ${styles.textMuted}`}>Start a new chat to begin!</p>
                </div>
              ) : (
                <>
                  {bookmarkedChats.length > 0 && (
                    <div>
                      <div className={`flex items-center space-x-2 px-2 mb-2 ${styles.textMuted}`}>
                        <FaStar className="text-yellow-500 text-xs" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Bookmarked</span>
                      </div>
                      <div className="space-y-2">
                        {bookmarkedChats.map((chat) => (
                          <ChatItem key={chat._id} chat={chat} isActive={currentChat?._id === chat._id}
                            onSelect={onChatSelect} onDelete={onDeleteChat} onToggleBookmark={onToggleBookmark} isDarkMode={isDarkMode}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {recentChats.length > 0 && (
                    <div>
                      <div className={`flex items-center space-x-2 px-2 mb-2 ${styles.textMuted}`}>
                        <FaClock className="text-xs" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Recent</span>
                      </div>
                      <div className="space-y-2">
                        {recentChats.map((chat) => (
                          <ChatItem key={chat._id} chat={chat} isActive={currentChat?._id === chat._id}
                            onSelect={onChatSelect} onDelete={onDeleteChat} onToggleBookmark={onToggleBookmark} isDarkMode={isDarkMode}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* User Profile */}
            <div className={`p-3 md:p-4 border-t ${styles.borderColor} ${isDarkMode ? "bg-gray-900/50" : "bg-gray-50/50"} backdrop-blur-lg`}>
              <div
                className={`${styles.bgCard} rounded-xl md:rounded-2xl p-3 md:p-4 border ${styles.borderColor} ${styles.shadow} cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden`}
                onClick={() => setShowMenu(!showMenu)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-purple-600/0 to-indigo-600/0 group-hover:from-violet-600/5 group-hover:via-purple-600/5 group-hover:to-indigo-600/5 transition-all duration-300" />
                <div className="relative z-10 flex items-start space-x-2 md:space-x-3">
                  <div className="relative flex-shrink-0 group/avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover border-2 border-purple-500/30" />
                    ) : (
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg"
                        style={{ background: user?.avatarColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                      >
                        {getInitials()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    <motion.button initial={{ opacity: 0, scale: 0.8 }} whileHover={{ scale: 1.1 }}
                      onClick={(e) => { e.stopPropagation(); setShowProfileEditor(true); }}
                      className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity shadow-lg"
                    >
                      <FaCamera className="text-[8px] md:text-[10px]" />
                    </motion.button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs md:text-sm font-bold ${styles.textPrimary} truncate`}>
                      {user?.displayName || user?.name || user?.username}
                    </p>
                    <p className={`text-xs ${styles.textMuted} truncate`}>{user?.email}</p>
                    {user?.bio && (
                      <p className={`text-xs ${styles.textTertiary} mt-1 line-clamp-2 italic leading-relaxed hidden sm:block`}>"{user.bio}"</p>
                    )}
                  </div>
                  <button className={`p-1.5 md:p-2 ${styles.bgHover} rounded-lg transition-colors flex-shrink-0`}>
                    <FaEllipsisV className={`${styles.textMuted} text-xs md:text-sm`} />
                  </button>
                </div>
                <div className={`relative z-10 mt-2 md:mt-3 pt-2 md:pt-3 border-t ${styles.borderColor}`}>
                  <div className={`flex items-center justify-between text-xs ${styles.textMuted}`}>
                    <span className="flex items-center space-x-1">
                      <FaGraduationCap className="text-purple-400 flex-shrink-0" />
                      <span className="truncate">{user?.course || "BCA"} • {user?.semester || "Sem 6"}</span>
                    </span>
                    <span className="truncate max-w-[100px]">{user?.university || "University"}</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`mt-2 md:mt-3 ${styles.bgSecondary} border ${styles.borderColor} rounded-xl md:rounded-2xl ${styles.shadow} overflow-hidden`}
                  >
                    <button onClick={() => { setShowProfileEditor(true); setShowMenu(false); }}
                      className={`w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3.5 ${styles.bgHover} transition-colors text-left`}
                    >
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-blue-400 text-xs md:text-sm" />
                      </div>
                      <span className={`text-xs md:text-sm ${styles.textPrimary} font-medium`}>Edit Profile</span>
                    </button>
                    <button onClick={() => { setShowSettings(true); setShowMenu(false); }}
                      className={`w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3.5 ${styles.bgHover} transition-colors text-left`}
                    >
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <FaCog className="text-purple-400 text-xs md:text-sm" />
                      </div>
                      <span className={`text-xs md:text-sm ${styles.textPrimary} font-medium`}>Settings</span>
                    </button>
                    <div className={`border-t ${styles.borderColor}`} />
                    <button onClick={() => { setShowMenu(false); onLogout(); }}
                      className="w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3.5 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <FaDoorOpen className="text-red-400 text-xs md:text-sm" />
                      </div>
                      <span className="text-xs md:text-sm text-red-400 font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onLogout}
                className="w-full mt-2 md:mt-3 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2.5 md:py-3 rounded-xl transition-all shadow-lg shadow-red-500/25 font-semibold text-sm md:text-base"
              >
                <FaSignOutAlt className="text-sm md:text-base" /><span>Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showProfileEditor && (
          <ProfileEditor user={user} onClose={() => setShowProfileEditor(false)}
            onUpdate={(updatedUser) => { onUpdateUser(updatedUser); setShowProfileEditor(false); }}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSettings && (
          <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)}
            settings={settings} onUpdateSettings={handleUpdateSettings} isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Chat Item ────────────────────────────────────────────────
function ChatItem({ chat, isActive, onSelect, onDelete, onToggleBookmark, isDarkMode }) {
  const styles = getThemeStyles(isDarkMode);
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: 4 }}
      className={`group relative p-2.5 md:p-3.5 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 ${isActive
        ? "bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-purple-500/25"
        : `${styles.bgCard} ${styles.bgHover} border ${styles.borderColor}`
        }`}
      onClick={() => onSelect(chat._id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className={`text-xs md:text-sm font-semibold truncate ${isActive ? "text-white" : styles.textPrimary}`}>
            {chat.title || "Untitled Chat"}
          </h3>
          <p className={`text-xs mt-1 flex items-center space-x-1 ${isActive ? "text-white/70" : styles.textMuted}`}>
            <FaClock className="text-[10px] flex-shrink-0" />
            <span className="truncate">
              {new Date(chat.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(chat._id); }}
            className={`p-1.5 rounded-lg transition-colors ${isActive ? "hover:bg-white/20" : styles.bgHover}`}
          >
            {chat.bookmarked
              ? <FaBookmark className="text-yellow-400 text-xs" />
              : <FaRegBookmark className={`text-xs ${isActive ? "text-white/70" : styles.textMuted}`} />
            }
          </motion.button>
          <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this chat?")) onDelete(chat._id); }}
            className={`p-1.5 rounded-lg transition-colors ${isActive ? "hover:bg-white/20" : "hover:bg-red-500/20"}`}
          >
            <FaTrash className={`text-xs ${isActive ? "text-white/70" : "text-red-400"}`} />
          </motion.button>
        </div>
      </div>
      {chat.bookmarked && !isActive && (
        <div className="absolute top-2 right-2 opacity-100 group-hover:opacity-0 transition-opacity">
          <FaBookmark className="text-yellow-400 text-xs" />
        </div>
      )}
    </motion.div>
  );
}

export default Sidebar;