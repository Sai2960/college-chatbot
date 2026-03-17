/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaFire, FaBook, FaClipboardList, FaTrophy, FaChartLine, FaClock } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

export default function StudyDashboard({ isDarkMode }) {
  const [stats, setStats]         = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]     = useState(true);

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [lbRes, asRes] = await Promise.all([
          axios.get("/api/social/leaderboard"),
          axios.get("/api/assignments"),
        ]);
        setLeaderboard(lbRes.data.data || []);
        setAssignments(asRes.data || []);

        // Build local stats from localStorage
        const pomodoroSessions = parseInt(localStorage.getItem("pomodoroSessions") || "0");
        const studyStreak      = parseInt(localStorage.getItem("studyStreak") || "1");
        setStats({ pomodoroSessions, studyStreak });
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const pending   = assignments.filter(a => a.status === "pending").length;
  const completed = assignments.filter(a => a.status === "completed").length;
  const overdue   = assignments.filter(a => a.status !== "completed" && new Date(a.dueDate) < new Date()).length;
  const myRank    = leaderboard.findIndex(e => e.weeklyQuestions > 0) + 1;
  const myScore   = leaderboard[0]?.weeklyQuestions || 0;

  const STAT_CARDS = [
    { icon: FaFire,          label: "Study Streak",    value: `${stats?.studyStreak || 1} days`,   color: "from-orange-500 to-red-500",    bg: "bg-orange-500/10" },
    { icon: FaClock,         label: "Focus Sessions",  value: stats?.pomodoroSessions || 0,         color: "from-purple-500 to-violet-500", bg: "bg-purple-500/10" },
    { icon: FaClipboardList, label: "Pending Tasks",   value: pending,                              color: "from-yellow-500 to-orange-500", bg: "bg-yellow-500/10" },
    { icon: FaTrophy,        label: "Completed",       value: completed,                            color: "from-green-500 to-emerald-500", bg: "bg-green-500/10"  },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <HiSparkles className="text-yellow-300" />
          <p className="text-white/80 text-xs">Your Study Overview</p>
        </div>
        <p className="text-white font-bold text-base">Keep up the great work! 🎓</p>
        {overdue > 0 && (
          <p className="text-red-300 text-xs mt-1">⚠️ {overdue} assignment{overdue > 1 ? "s" : ""} overdue!</p>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-2">
        {STAT_CARDS.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${cardBg} border rounded-2xl p-3`}>
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`text-sm bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                style={{ color: stat.color.includes("orange") ? "#f97316" : stat.color.includes("purple") ? "#a855f7" : stat.color.includes("yellow") ? "#eab308" : "#22c55e" }}
              />
            </div>
            <p className={`text-xl font-bold ${textPrimary}`}>{stat.value}</p>
            <p className={`text-xs ${textMuted}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Assignment Progress */}
      {assignments.length > 0 && (
        <div className={`${cardBg} border rounded-2xl p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <FaChartLine className="text-blue-400" />
            <h3 className={`font-semibold text-sm ${textPrimary}`}>Assignment Progress</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Completed", count: completed, color: "bg-green-400", total: assignments.length },
              { label: "Pending",   count: pending,   color: "bg-yellow-400", total: assignments.length },
              { label: "Overdue",   count: overdue,   color: "bg-red-400", total: assignments.length },
            ].map(({ label, count, color, total }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className={`text-xs ${textMuted}`}>{label}</span>
                  <span className={`text-xs font-semibold ${textPrimary}`}>{count}/{total}</span>
                </div>
                <div className={`w-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                  <div className={`h-2 rounded-full ${color} transition-all`}
                    style={{ width: total ? `${(count / total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {assignments.filter(a => a.status !== "completed").slice(0, 3).length > 0 && (
        <div className={`${cardBg} border rounded-2xl p-4`}>
          <h3 className={`font-semibold text-sm ${textPrimary} mb-3`}>📅 Upcoming Deadlines</h3>
          <div className="space-y-2">
            {assignments.filter(a => a.status !== "completed")
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .slice(0, 3).map((a, i) => {
                const days = Math.ceil((new Date(a.dueDate) - new Date()) / 86400000);
                return (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-xl ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <div>
                      <p className={`text-xs font-semibold ${textPrimary}`}>{a.title}</p>
                      <p className={`text-xs ${textMuted}`}>{a.subject}</p>
                    </div>
                    <span className={`text-xs font-bold ${days < 0 ? "text-red-400" : days === 0 ? "text-orange-400" : days <= 3 ? "text-yellow-400" : "text-green-400"}`}>
                      {days < 0 ? "Overdue!" : days === 0 ? "Today!" : `${days}d left`}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Mini Leaderboard */}
      {leaderboard.length > 0 && (
        <div className={`${cardBg} border rounded-2xl p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <FaTrophy className="text-yellow-400" />
            <h3 className={`font-semibold text-sm ${textPrimary}`}>Top Performers</h3>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 3).map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-base">{["🥇","🥈","🥉"][i]}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: entry.avatarColor || "linear-gradient(135deg,#667eea,#764ba2)" }}>
                  {entry.userName?.charAt(0).toUpperCase()}
                </div>
                <p className={`text-xs flex-1 ${textPrimary}`}>{entry.userName}</p>
                <p className={`text-xs font-bold ${textPrimary}`}>{entry.weeklyQuestions} Qs</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}