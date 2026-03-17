/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaClock } from "react-icons/fa";

const DAYS    = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const PERIODS = ["9:00","10:00","11:00","12:00","1:00","2:00","3:00","4:00","5:00"];
const COLORS  = [
  "bg-violet-500","bg-blue-500","bg-green-500","bg-yellow-500",
  "bg-red-500","bg-pink-500","bg-cyan-500","bg-orange-500","bg-indigo-500",
];

export default function TimetableBuilder({ isDarkMode }) {
  const [timetable, setTimetable] = useState(() => {
    try { return JSON.parse(localStorage.getItem("timetable") || "{}"); }
    catch { return {}; }
  });
  const [subjects, setSubjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ttSubjects") || "[]"); }
    catch { return []; }
  });
  const [selected, setSelected]     = useState(null);
  const [newSubject, setNewSubject]  = useState("");
  const [view, setView]             = useState("week");

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";
  const cellBg      = isDarkMode ? "bg-gray-700/50 hover:bg-gray-600/50" : "bg-gray-50 hover:bg-gray-100";

  useEffect(() => { localStorage.setItem("timetable",   JSON.stringify(timetable));  }, [timetable]);
  useEffect(() => { localStorage.setItem("ttSubjects",  JSON.stringify(subjects)); }, [subjects]);

  const getKey = (day, period) => `${day}-${period}`;

  const handleCellClick = (day, period) => {
    if (!selected) return;
    const key = getKey(day, period);
    setTimetable(prev => {
      if (prev[key]?.subject === selected) {
        const updated = { ...prev }; delete updated[key]; return updated;
      }
      return { ...prev, [key]: { subject: selected, color: COLORS[subjects.indexOf(selected) % COLORS.length] } };
    });
  };

  const addSubject = () => {
    if (!newSubject.trim() || subjects.includes(newSubject.trim())) return;
    setSubjects([...subjects, newSubject.trim()]);
    setNewSubject("");
  };

  const removeSubject = (sub) => {
    setSubjects(subjects.filter(s => s !== sub));
    setTimetable(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => { if (updated[k]?.subject === sub) delete updated[k]; });
      return updated;
    });
    if (selected === sub) setSelected(null);
  };

  const todayClasses = () => {
    const days  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = days[new Date().getDay()];
    return PERIODS.map(p => ({ period: p, entry: timetable[getKey(today, p)] })).filter(c => c.entry);
  };

  // Abbreviate long subject names for the cell
  const abbreviate = (name) => {
    if (name.length <= 6) return name;
    return name.split(" ").map(w => w[0].toUpperCase()).join("") || name.slice(0, 5);
  };

  return (
    <div className="space-y-3">
      {/* View Toggle */}
      <div className="flex gap-2">
        {["week","today"].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              view === v
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}>
            {v === "week" ? "📅 Week View" : "📌 Today"}
          </button>
        ))}
      </div>

      {/* Subjects Panel */}
      <div className={`${cardBg} border rounded-2xl p-3`}>
        <p className={`text-xs font-bold mb-2 ${textPrimary}`}>Subjects</p>
        <div className="flex gap-2 mb-2">
          <input placeholder="Add subject (e.g. C#, Python)" value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
            className={`flex-1 ${inputBg} px-3 py-1.5 rounded-lg text-xs border focus:outline-none`}
          />
          <button onClick={addSubject}
            className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold">
            <FaPlus className="text-[10px]" />
          </button>
        </div>

        {/* Subject Badges — FIXED: only renders name once */}
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((sub, i) => (
            <motion.div key={sub} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(selected === sub ? null : sub)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all text-white ${
                COLORS[i % COLORS.length]
              } ${selected === sub ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800" : "opacity-80 hover:opacity-100"}`}>
              {/* ✅ Name shown ONCE only */}
              <span className="max-w-[90px] truncate">{sub}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeSubject(sub); }}
                className="ml-0.5 hover:text-red-200 leading-none flex-shrink-0">
                ×
              </button>
            </motion.div>
          ))}
        </div>

        {selected && (
          <p className={`text-xs mt-2 ${textMuted}`}>
            ✏️ Clicking cells to add/remove{" "}
            <span className="text-purple-400 font-semibold">{selected}</span>
          </p>
        )}
      </div>

      {/* Today View */}
      {view === "today" && (
        <div className={`${cardBg} border rounded-2xl p-3`}>
          <p className={`text-xs font-bold mb-2 ${textPrimary}`}>
            📌 Today — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          {todayClasses().length === 0 ? (
            <p className={`text-xs ${textMuted} text-center py-4`}>No classes today! 🎉</p>
          ) : (
            <div className="space-y-2">
              {todayClasses().map(({ period, entry }) => (
                <div key={period} className={`flex items-center gap-3 p-2 rounded-xl ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                  <FaClock className={`text-xs ${textMuted}`} />
                  <span className={`text-xs ${textMuted} w-10`}>{period}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs text-white font-medium ${entry.color}`}>
                    {entry.subject}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className={`${cardBg} border rounded-2xl overflow-hidden`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/30">
            <p className={`text-xs font-bold ${textPrimary}`}>Weekly Timetable</p>
            <button onClick={() => setTimetable({})} className={`text-xs ${textMuted} hover:text-red-400`}>
              Clear All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className={`p-2 text-left ${textMuted} font-medium w-12`}>Time</th>
                  {DAYS.map(day => (
                    <th key={day} className={`p-2 text-center ${textMuted} font-medium min-w-[70px]`}>
                      {day.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => (
                  <tr key={period}>
                    <td className={`p-1.5 ${textMuted} text-[10px] font-mono whitespace-nowrap`}>{period}</td>
                    {DAYS.map(day => {
                      const key   = getKey(day, period);
                      const entry = timetable[key];
                      return (
                        <td key={day} className="p-0.5">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCellClick(day, period)}
                            title={entry ? entry.subject : selected ? `Add ${selected}` : ""}
                            className={`h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                              entry
                                ? `${entry.color} text-white`
                                : `${cellBg} ${textMuted}`
                            }`}>
                            {entry ? (
                              // ✅ Show abbreviation in cell, full name on hover (title)
                              <span className="text-[10px] font-bold tracking-wide px-1 text-center leading-tight">
                                {abbreviate(entry.subject)}
                              </span>
                            ) : (
                              <span className="text-[11px] opacity-40">{selected ? "+" : ""}</span>
                            )}
                          </motion.div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}