/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaStickyNote, FaCopy, FaCheck } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const MODES = [
  { value: "summary",    label: "📄 Summary",    prompt: "Summarize these lecture notes in clear, concise paragraphs. Highlight the most important concepts:" },
  { value: "bullets",   label: "• Key Points",  prompt: "Convert these lecture notes into well-organized bullet points grouped by topic:" },
  { value: "flashcards",label: "🃏 Flashcards",  prompt: "Convert these lecture notes into 6-8 flashcard-style Q&A pairs. Format as:\nQ: question\nA: answer\n\n" },
];

export default function NotesSummarizer({ isDarkMode }) {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("summary");
  const [copied, setCopied] = useState(false);

  const cardBg    = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg   = isDarkMode ? "bg-gray-700 text-white border-gray-600 placeholder-gray-500" : "bg-gray-100 text-gray-900 border-gray-300 placeholder-gray-400";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const handleSummarize = async () => {
    if (!notes.trim()) return;
    setLoading(true); setSummary("");
    const selectedMode = MODES.find((m) => m.value === mode);
    try {
      // Uses your existing /api/chat/message endpoint
      const { data } = await axios.post("/api/chat/message", {
        message: `${selectedMode.prompt}\n\n${notes}`,
        chatId: null,
      });
      // Handle different response field names your backend might return
      const result = data?.data?.message || data?.reply || data?.message || data?.response || "No summary generated.";
      setSummary(result);
    } catch {
      setSummary("❌ Failed to summarize. Please check your connection and try again.");
    } finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {MODES.map((m) => (
          <motion.button key={m.value}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setMode(m.value)}
            className={`py-2 text-xs rounded-xl font-medium transition-all ${
              mode === m.value
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                : isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Input Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`${cardBg} border rounded-2xl p-4 space-y-3`}
      >
        <div className="flex items-center space-x-2">
          <FaStickyNote className="text-yellow-400 text-lg" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>Paste Your Lecture Notes</h3>
        </div>

        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={7}
          placeholder="Paste your lecture notes, textbook content, or any study material here..."
          className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none`}
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs ${textMuted}`}>{wordCount} words</span>
          <div className="flex items-center space-x-2">
            {notes && (
              <button onClick={() => { setNotes(""); setSummary(""); }}
                className={`text-xs ${textMuted} hover:text-red-400 transition-colors`}
              >
                Clear
              </button>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSummarize}
              disabled={loading || !notes.trim()}
              className="flex items-center space-x-2 py-2 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
            >
              <HiSparkles className="text-sm" />
              <span>{loading ? "Summarizing..." : "Summarize"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Output */}
      <AnimatePresence>
        {(loading || summary) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`${cardBg} border rounded-2xl p-4 space-y-3`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${textPrimary}`}>
                {MODES.find((m) => m.value === mode)?.label}
              </p>
              {summary && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`flex items-center space-x-1.5 text-xs py-1 px-2.5 rounded-lg ${
                    copied ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                  } transition-all`}
                >
                  {copied ? <FaCheck className="text-[10px]" /> : <FaCopy className="text-[10px]" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </motion.button>
              )}
            </div>

            {loading ? (
              <div className="flex space-x-1.5 items-center py-3">
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
                <span className={`text-xs ml-2 ${textMuted}`}>AI is processing your notes...</span>
              </div>
            ) : (
              <div className={`text-sm ${textPrimary} whitespace-pre-wrap leading-relaxed`}>
                {summary}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}