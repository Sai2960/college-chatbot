/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaBook, FaClock, FaLightbulb, FaCheckCircle } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useHistory } from "../hooks/useHistory";

export default function StudyPlanner({ isDarkMode }) {
  const [form, setForm]         = useState({ subjects: "", examDate: "", hoursPerDay: 4 });
  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const history                 = useHistory("study");

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const handleGenerate = async () => {
    if (!form.subjects.trim() || !form.examDate) return;
    setLoading(true); setPlan(null);
    try {
      const { data } = await axios.post("/api/study/generate", form);
      setPlan(data); setActiveDay(0);

      // ✅ Save to history
      history.save({
        title:   `Study Plan: ${form.subjects.slice(0, 50)}`,
        preview: `${data.totalDays} days • ${data.hoursPerDay}h/day • Exam: ${form.examDate}`,
        meta:    { Subjects: form.subjects, Days: `${data.totalDays}`, Hours: `${data.hoursPerDay}h/day`, Exam: form.examDate },
        content: `${data.totalDays}-day plan for: ${form.subjects}\nGeneral Tips: ${data.generalTips?.join("; ")}`,
      });
    } catch { alert("Failed to generate study plan. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-blue-400 text-lg" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>Generate Study Plan</h3>
        </div>
        <div>
          <label className={`text-xs ${textMuted} mb-1 block`}>Subjects (comma-separated)</label>
          <input type="text" placeholder="e.g. Math, Physics, Chemistry"
            value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })}
            className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
          />
        </div>
        <div>
          <label className={`text-xs ${textMuted} mb-1 block`}>Exam Date</label>
          <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
          />
        </div>
        <div>
          <label className={`text-xs ${textMuted} mb-2 block`}>Study hours/day: <span className="text-purple-400 font-bold">{form.hoursPerDay}h</span></label>
          <input type="range" min={1} max={12} value={form.hoursPerDay}
            onChange={(e) => setForm({ ...form, hoursPerDay: Number(e.target.value) })}
            className="w-full accent-purple-500"
          />
          <div className={`flex justify-between text-xs ${textMuted} mt-1`}><span>1h</span><span>6h</span><span>12h</span></div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGenerate} disabled={loading || !form.subjects.trim() || !form.examDate}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center space-x-2">
          <HiSparkles /><span>{loading ? "Generating AI plan..." : "Generate Study Plan"}</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center space-x-2">
              <FaCalendarAlt className="text-blue-400 flex-shrink-0" />
              <p className="text-blue-300 text-sm font-medium">{plan.totalDays} day plan • {plan.hoursPerDay}h/day</p>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {plan.plan?.map((day, i) => (
                <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveDay(i)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${activeDay === i ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                  D{day.day}
                </motion.button>
              ))}
            </div>
            {plan.plan?.[activeDay] && (
              <motion.div key={activeDay} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
                <div className="flex items-center justify-between">
                  <p className={`font-bold text-sm ${textPrimary}`}>Day {plan.plan[activeDay].day}</p>
                  <p className={`text-xs ${textMuted}`}>{plan.plan[activeDay].date}</p>
                </div>
                <div className="space-y-2">
                  {plan.plan[activeDay].tasks?.map((task, i) => (
                    <div key={i} className={`${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl p-2.5 flex items-start gap-2`}>
                      <FaBook className="text-purple-400 mt-0.5 flex-shrink-0 text-xs" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${textPrimary}`}>{task.subject}</p>
                        <p className={`text-xs ${textMuted}`}>{task.topic}</p>
                      </div>
                      <span className={`text-xs ${textMuted} flex-shrink-0 flex items-center`}><FaClock className="mr-1 text-[10px]" />{task.duration}</span>
                    </div>
                  ))}
                </div>
                {plan.plan[activeDay].tip && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-2.5 flex items-start space-x-2">
                    <FaLightbulb className="text-yellow-400 flex-shrink-0 mt-0.5 text-xs" />
                    <p className="text-yellow-300 text-xs">{plan.plan[activeDay].tip}</p>
                  </div>
                )}
              </motion.div>
            )}
            {plan.generalTips?.length > 0 && (
              <div className={`${cardBg} border rounded-2xl p-4`}>
                <p className={`text-xs font-bold mb-2 ${textPrimary}`}>💡 General Tips</p>
                <ul className="space-y-1.5">
                  {plan.generalTips.map((tip, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <FaCheckCircle className="text-green-400 text-xs mt-0.5 flex-shrink-0" />
                      <span className={`text-xs ${textMuted}`}>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}