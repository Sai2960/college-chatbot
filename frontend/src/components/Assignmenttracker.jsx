/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaRobot, FaCheckCircle, FaClock, FaExclamationCircle } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const PRIORITY_STYLES = {
  low:    "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high:   "bg-red-500/20 text-red-400 border-red-500/30",
};
const STATUS_STYLES = {
  pending:     "text-yellow-400",
  "in-progress": "text-blue-400",
  completed:   "text-green-400",
};

export default function AssignmentTracker({ isDarkMode }) {
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [reminder, setReminder] = useState("");
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", dueDate: "", priority: "medium", notes: "" });

  const cardBg  = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const fetch = async () => {
    try { const { data } = await axios.get("/api/assignments"); setAssignments(data); }
    catch { /* silent */ }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.subject || !form.dueDate) return;
    try {
      await axios.post("/api/assignments", form);
      setForm({ title: "", subject: "", dueDate: "", priority: "medium", notes: "" });
      setShowForm(false);
      fetch();
    } catch { alert("Failed to create assignment"); }
  };

  const handleStatus = async (id, status) => {
    try { await axios.put(`/api/assignments/${id}`, { status }); fetch(); }
    catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`/api/assignments/${id}`); fetch(); }
    catch { /* silent */ }
  };

  const getReminder = async () => {
    setLoadingReminder(true); setReminder("");
    try { const { data } = await axios.post("/api/assignments/ai-remind"); setReminder(data.message); }
    catch { setReminder("Could not get AI reminder."); }
    finally { setLoadingReminder(false); }
  };

  const getDaysLeft = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
    if (days < 0) return <span className="text-red-400 text-xs font-medium">Overdue!</span>;
    if (days === 0) return <span className="text-orange-400 text-xs font-medium">Due Today!</span>;
    return <span className={`text-xs ${days <= 3 ? "text-orange-400" : textMuted}`}>{days}d left</span>;
  };

  return (
    <div className="space-y-3">
      {/* AI Reminder */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={getReminder}
        disabled={loadingReminder}
        className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25 disabled:opacity-60"
      >
        <FaRobot className="text-base" />
        <span>{loadingReminder ? "Getting AI reminder..." : "Get AI Reminder"}</span>
      </motion.button>

      <AnimatePresence>
        {reminder && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="bg-purple-900/30 border border-purple-600/50 rounded-xl p-3 text-sm text-purple-200 leading-relaxed"
          >
            {reminder}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${textPrimary}`}>
          {assignments.length} Assignment{assignments.length !== 1 ? "s" : ""}
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all"
        >
          <FaPlus className="text-[10px]" />
          <span>{showForm ? "Cancel" : "Add New"}</span>
        </motion.button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className={`${cardBg} border rounded-2xl p-4 space-y-3 overflow-hidden`}
          >
            {[
              { placeholder: "Assignment title *", key: "title", type: "text" },
              { placeholder: "Subject *", key: "subject", type: "text" },
            ].map(({ placeholder, key, type }) => (
              <input key={key} type={type} placeholder={placeholder} value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              />
            ))}
            <input type="date" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
            />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none`}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
            <textarea placeholder="Notes (optional)" value={form.notes} rows={2}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none resize-none`}
            />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={!form.title || !form.subject || !form.dueDate}
              className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
            >
              Save Assignment
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment List */}
      <div className="space-y-2">
        {assignments.length === 0 && (
          <div className={`text-center py-8 ${textMuted} text-sm`}>
            <FaCheckCircle className="mx-auto mb-2 text-2xl opacity-30" />
            <p>No assignments yet. Add one!</p>
          </div>
        )}
        <AnimatePresence>
          {assignments.map((a) => (
            <motion.div key={a._id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className={`${cardBg} border rounded-xl p-3 ${a.status === "completed" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${a.status === "completed" ? "line-through " + textMuted : textPrimary}`}>
                    {a.title}
                  </p>
                  <p className={`text-xs ${textMuted}`}>{a.subject}</p>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[a.priority]}`}>
                  {a.priority}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 gap-1">
                <div className="flex items-center space-x-2">
                  {getDaysLeft(a.dueDate)}
                  <span className={`text-xs ${STATUS_STYLES[a.status]}`}>• {a.status}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <select value={a.status}
                    onChange={(e) => handleStatus(a._id, e.target.value)}
                    className={`${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"} text-xs rounded-lg px-1.5 py-1 outline-none border-0`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(a._id)}
                    className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <FaTrash className="text-xs" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}