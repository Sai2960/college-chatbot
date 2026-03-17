/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaBrain, FaTrophy, FaRedo } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useHistory } from "../hooks/useHistory";

export default function QuizGenerator({ isDarkMode }) {
  const [form, setForm]         = useState({ topic: "", numQuestions: 5, difficulty: "medium" });
  const [quiz, setQuiz]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [answers, setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]       = useState(0);
  const history                 = useHistory("quiz");

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const handleGenerate = async () => {
    if (!form.topic.trim()) return;
    setLoading(true); setQuiz(null); setAnswers({}); setSubmitted(false);
    try {
      const { data } = await axios.post("/api/quiz/generate", form);
      setQuiz(data);

      // ✅ Save to history
      history.save({
        title:     `Quiz: ${form.topic}`,
        preview:   `${form.difficulty} • ${data.questions?.length} questions`,
        meta:      { Topic: form.topic, Difficulty: form.difficulty, Questions: `${data.questions?.length}` },
        questions: data.questions,
      });
    } catch { alert("Failed to generate quiz. Please try again."); }
    finally { setLoading(false); }
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.questions.forEach((q) => { if (answers[q.id] === q.correctAnswer) correct++; });
    setScore(correct); setSubmitted(true);
  };

  const getOptionStyle = (q, option) => {
    const letter   = option.charAt(0);
    const selected = answers[q.id] === letter;
    const correct  = q.correctAnswer === letter;
    if (!submitted) {
      return selected
        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-purple-500"
        : isDarkMode ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600" : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100";
    }
    if (correct) return "bg-green-500/20 text-green-300 border-green-500/50";
    if (selected && !correct) return "bg-red-500/20 text-red-300 border-red-500/50";
    return isDarkMode ? "bg-gray-700 text-gray-400 border-gray-600" : "bg-gray-50 text-gray-400 border-gray-200";
  };

  const scorePercent = quiz ? Math.round((score / quiz.questions?.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center space-x-2">
          <FaBrain className="text-purple-400 text-lg" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>Generate Quiz</h3>
        </div>
        <input type="text" placeholder="Topic (e.g. Photosynthesis, World War 2)"
          value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.numQuestions} onChange={(e) => setForm({ ...form, numQuestions: Number(e.target.value) })}
            className={`${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none`}>
            {[3,5,7,10].map(n => <option key={n} value={n}>{n} questions</option>)}
          </select>
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className={`${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none`}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGenerate} disabled={loading || !form.topic.trim()}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center space-x-2">
          <HiSparkles /><span>{loading ? "Generating quiz..." : "Generate Quiz"}</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {quiz && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className={`text-xs text-center ${textMuted}`}>{quiz.topic} • {quiz.difficulty} • {quiz.questions?.length} questions</p>
            {quiz.questions?.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`${cardBg} border rounded-2xl p-3 space-y-2`}>
                <p className={`text-sm font-semibold ${textPrimary}`}>{i+1}. {q.question}</p>
                <div className="space-y-1.5">
                  {q.options.map((option) => {
                    const letter = option.charAt(0);
                    return (
                      <motion.button key={letter}
                        whileHover={!submitted ? { x: 2 } : {}} whileTap={!submitted ? { scale: 0.98 } : {}}
                        onClick={() => !submitted && setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all ${getOptionStyle(q, option)}`}>
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <p className={`text-xs italic ${textMuted} pt-1 border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>💡 {q.explanation}</p>
                )}
              </motion.div>
            ))}
            {!submitted ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} disabled={Object.keys(answers).length < quiz.questions?.length}
                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
                Submit Quiz ({Object.keys(answers).length}/{quiz.questions?.length} answered)
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`${cardBg} border rounded-2xl p-5 text-center space-y-2`}>
                <FaTrophy className={`mx-auto text-3xl ${scorePercent >= 70 ? "text-yellow-400" : "text-gray-400"}`} />
                <p className={`text-3xl font-bold ${textPrimary}`}>{score}/{quiz.questions?.length}</p>
                <p className={`text-sm ${textMuted}`}>
                  {scorePercent === 100 ? "🎉 Perfect score!" : scorePercent >= 70 ? "👍 Great job!" : scorePercent >= 50 ? "📚 Keep studying!" : "💪 Don't give up!"}
                </p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate}
                  className="mt-2 flex items-center space-x-2 mx-auto py-2 px-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold">
                  <FaRedo className="text-xs" /><span>Try Again</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}