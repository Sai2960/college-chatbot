/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaTrophy, FaChartBar } from "react-icons/fa";

const GRADE_POINTS = { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "D": 4, "F": 0 };

export default function GPACalculator({ isDarkMode }) {
  const [subjects, setSubjects] = useState([
    { name: "", credits: 3, grade: "O" },
    { name: "", credits: 3, grade: "A+" },
  ]);
  const [semesters, setSemesters] = useState([]);
  const [semName, setSemName]     = useState("Semester 1");

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const calcSGPA = (subs) => {
    const totalCredits = subs.reduce((a, s) => a + Number(s.credits), 0);
    const totalPoints  = subs.reduce((a, s) => a + Number(s.credits) * (GRADE_POINTS[s.grade] || 0), 0);
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const calcCGPA = () => {
    if (!semesters.length) return "0.00";
    const totalCredits = semesters.reduce((a, s) => a + s.totalCredits, 0);
    const totalPoints  = semesters.reduce((a, s) => a + s.totalPoints, 0);
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const currentSGPA = calcSGPA(subjects);

  const addSubject = () => setSubjects([...subjects, { name: "", credits: 3, grade: "O" }]);
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i, field, val) => {
    const updated = [...subjects];
    updated[i][field] = val;
    setSubjects(updated);
  };

  const saveSemester = () => {
    const totalCredits = subjects.reduce((a, s) => a + Number(s.credits), 0);
    const totalPoints  = subjects.reduce((a, s) => a + Number(s.credits) * (GRADE_POINTS[s.grade] || 0), 0);
    setSemesters(prev => [...prev, { name: semName, sgpa: currentSGPA, totalCredits, totalPoints }]);
    setSubjects([{ name: "", credits: 3, grade: "O" }]);
    setSemName(`Semester ${semesters.length + 2}`);
  };

  const sgpaColor = currentSGPA >= 9 ? "text-green-400" : currentSGPA >= 7 ? "text-blue-400" : currentSGPA >= 5 ? "text-yellow-400" : "text-red-400";
  const cgpa = calcCGPA();
  const cgpaColor = cgpa >= 9 ? "text-green-400" : cgpa >= 7 ? "text-blue-400" : cgpa >= 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-3">
      {/* SGPA Card */}
      <div className={`${cardBg} border rounded-2xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaChartBar className="text-purple-400" />
            <h3 className={`font-semibold text-sm ${textPrimary}`}>{semName}</h3>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${sgpaColor}`}>{currentSGPA}</p>
            <p className={`text-xs ${textMuted}`}>SGPA</p>
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          {subjects.map((sub, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input placeholder={`Subject ${i+1}`} value={sub.name}
                onChange={(e) => updateSubject(i, "name", e.target.value)}
                className={`flex-1 ${inputBg} px-2 py-1.5 rounded-lg text-xs border focus:outline-none`}
              />
              <select value={sub.credits} onChange={(e) => updateSubject(i, "credits", e.target.value)}
                className={`w-14 ${inputBg} px-1 py-1.5 rounded-lg text-xs border focus:outline-none`}>
                {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c}cr</option>)}
              </select>
              <select value={sub.grade} onChange={(e) => updateSubject(i, "grade", e.target.value)}
                className={`w-14 ${inputBg} px-1 py-1.5 rounded-lg text-xs border focus:outline-none`}>
                {Object.keys(GRADE_POINTS).map(g => <option key={g}>{g}</option>)}
              </select>
              <span className={`w-6 text-xs font-bold text-center ${
                GRADE_POINTS[sub.grade] >= 9 ? "text-green-400" :
                GRADE_POINTS[sub.grade] >= 7 ? "text-blue-400" :
                GRADE_POINTS[sub.grade] >= 5 ? "text-yellow-400" : "text-red-400"
              }`}>{GRADE_POINTS[sub.grade]}</span>
              <button onClick={() => removeSubject(i)} className="text-red-400 hover:text-red-300 p-1">
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={addSubject}
            className="flex-1 py-2 border border-dashed border-purple-500/50 text-purple-400 rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-purple-500/10">
            <FaPlus className="text-[10px]" /> Add Subject
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={saveSemester}
            className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-semibold">
            Save Semester
          </motion.button>
        </div>
      </div>

      {/* CGPA */}
      {semesters.length > 0 && (
        <div className={`${cardBg} border rounded-2xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              <h3 className={`font-semibold text-sm ${textPrimary}`}>Overall CGPA</h3>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${cgpaColor}`}>{cgpa}</p>
              <p className={`text-xs ${textMuted}`}>CGPA</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
            <div className={`h-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all`}
              style={{ width: `${(cgpa / 10) * 100}%` }} />
          </div>

          {/* Semester History */}
          <div className="space-y-1.5">
            {semesters.map((sem, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className={`text-xs ${textMuted}`}>{sem.name}</p>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-purple-400" style={{ width: `${(sem.sgpa / 10) * 100}%` }} />
                  </div>
                  <p className={`text-xs font-bold ${textPrimary} w-8 text-right`}>{sem.sgpa}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setSemesters([])}
            className={`mt-3 text-xs ${textMuted} hover:text-red-400`}>
            Clear all semesters
          </button>
        </div>
      )}

      {/* Grade Reference */}
      <div className={`${cardBg} border rounded-2xl p-3`}>
        <p className={`text-xs font-bold mb-2 ${textPrimary}`}>Grade Points Reference</p>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(GRADE_POINTS).map(([g, p]) => (
            <div key={g} className={`text-center py-1 rounded-lg text-xs ${
              p >= 9 ? "bg-green-500/20 text-green-400" :
              p >= 7 ? "bg-blue-500/20 text-blue-400" :
              p >= 5 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
            }`}>
              <span className="font-bold">{g}</span> = {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}