/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaCheck, FaTimes, FaExclamationTriangle } from "react-icons/fa";

export default function AttendanceTracker({ isDarkMode }) {
  const [subjects, setSubjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("attendance") || "[]"); }
    catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", total: 0, attended: 0 });

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(subjects));
  }, [subjects]);

  const getPercent = (s) => s.total === 0 ? 0 : Math.round((s.attended / s.total) * 100);

  const getStatus = (pct) => {
    if (pct >= 85) return { label: "Safe ✅", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" };
    if (pct >= 75) return { label: "OK ⚠️",  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" };
    return               { label: "Low 🚨",  color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30" };
  };

  const classesNeeded = (s) => {
    const pct = getPercent(s);
    if (pct >= 75) return null;
    // Classes needed to reach 75%: (0.75*(total+x) <= attended+x) => x = (0.75*total - attended) / 0.25
    const needed = Math.ceil((0.75 * s.total - s.attended) / 0.25);
    return needed > 0 ? needed : 0;
  };

  const canBunk = (s) => {
    const pct = getPercent(s);
    if (pct <= 75) return 0;
    // Max bunks: (attended / (total + x)) >= 0.75 => x = (attended/0.75) - total
    return Math.floor(s.attended / 0.75 - s.total);
  };

  const mark = (idx, present) => {
    const updated = [...subjects];
    updated[idx].total += 1;
    if (present) updated[idx].attended += 1;
    setSubjects(updated);
  };

  const addSubject = () => {
    if (!newSubject.name) return;
    setSubjects([...subjects, { ...newSubject, total: Number(newSubject.total), attended: Number(newSubject.attended) }]);
    setNewSubject({ name: "", total: 0, attended: 0 });
    setShowAdd(false);
  };

  const removeSubject = (idx) => setSubjects(subjects.filter((_, i) => i !== idx));

  const overallPct = subjects.length
    ? Math.round(subjects.reduce((a, s) => a + getPercent(s), 0) / subjects.length)
    : 0;

  return (
    <div className="space-y-3">
      {/* Overall */}
      {subjects.length > 0 && (
        <div className={`bg-gradient-to-r ${overallPct >= 75 ? "from-green-600 to-emerald-600" : "from-red-600 to-rose-600"} rounded-2xl p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs">Overall Attendance</p>
              <p className="text-white font-bold text-3xl">{overallPct}%</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs">{subjects.length} subjects</p>
              <p className="text-white text-sm font-semibold">
                {overallPct >= 85 ? "Excellent! 🎉" : overallPct >= 75 ? "Safe Zone ✅" : "Danger Zone 🚨"}
              </p>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${textPrimary}`}>{subjects.length} Subject{subjects.length !== 1 ? "s" : ""}</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg">
          <FaPlus className="text-[10px]" /> {showAdd ? "Cancel" : "Add Subject"}
        </motion.button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className={`${cardBg} border rounded-2xl p-3 space-y-2 overflow-hidden`}>
            <input placeholder="Subject name *" value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}
            />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Total classes" min={0} value={newSubject.total || ""}
                onChange={(e) => setNewSubject({ ...newSubject, total: e.target.value })}
                className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}
              />
              <input type="number" placeholder="Attended" min={0} value={newSubject.attended || ""}
                onChange={(e) => setNewSubject({ ...newSubject, attended: e.target.value })}
                className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}
              />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={addSubject} disabled={!newSubject.name}
              className="w-full py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">
              Add Subject
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Cards */}
      {subjects.length === 0 && (
        <div className={`text-center py-8 ${textMuted} text-xs`}>
          <FaExclamationTriangle className="mx-auto mb-2 text-2xl opacity-30" />
          <p>No subjects added yet.</p>
        </div>
      )}

      {subjects.map((sub, i) => {
        const pct    = getPercent(sub);
        const status = getStatus(pct);
        const needed = classesNeeded(sub);
        const bunks  = canBunk(sub);

        return (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className={`${cardBg} border rounded-2xl p-3 space-y-2`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-bold ${textPrimary}`}>{sub.name}</p>
                <p className={`text-xs ${textMuted}`}>{sub.attended}/{sub.total} classes attended</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <span className={`text-xl font-bold ${status.color}`}>{pct}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`w-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
              <div className={`h-2 rounded-full transition-all ${pct >= 85 ? "bg-green-400" : pct >= 75 ? "bg-yellow-400" : "bg-red-400"}`}
                style={{ width: `${pct}%` }} />
              {/* 75% marker */}
              <div className="relative">
                <div className="absolute top-[-8px] w-0.5 h-2 bg-white/50" style={{ left: "75%" }} />
              </div>
            </div>

            {/* Info */}
            <div className="flex items-center justify-between">
              <p className={`text-xs ${needed ? "text-red-400" : "text-green-400"}`}>
                {needed ? `⚠️ Need ${needed} more classes for 75%` : `✅ Can bunk ${bunks} more class${bunks !== 1 ? "es" : ""}`}
              </p>
            </div>

            {/* Quick Mark Buttons */}
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => mark(i, true)}
                className="flex-1 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                <FaCheck className="text-[10px]" /> Present
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => mark(i, false)}
                className="flex-1 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                <FaTimes className="text-[10px]" /> Absent
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => removeSubject(i)}
                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg">
                <FaTrash className="text-xs" />
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}