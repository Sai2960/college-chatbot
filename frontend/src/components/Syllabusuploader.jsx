/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload, FaFilePdf, FaCheckCircle, FaTimes, FaPaperPlane, FaTrash } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { FaRobot, FaUser } from "react-icons/fa";

export default function SyllabusUploader({ isDarkMode }) {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // ← history array
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const cardBg   = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg  = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";
  const chatBg      = isDarkMode ? "bg-gray-900/60" : "bg-gray-50";

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("syllabus", file);
      await axios.post("/api/syllabus/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploaded(true);
      setChatHistory([]); // reset history on new upload
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const userMsg = question.trim();
    setQuestion("");
    // Add user message immediately
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await axios.post("/api/syllabus/ask", { question: userMsg });
      setChatHistory((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch {
      setChatHistory((prev) => [...prev, { role: "ai", text: "❌ Failed to get answer. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUploaded(false);
    setFile(null);
    setChatHistory([]);
    setQuestion("");
  };

  return (
    <div className={`flex h-full gap-3 ${uploaded ? "flex-row" : "flex-col"}`}>

      {/* ── LEFT: Upload Panel ── */}
      <div className={`${uploaded ? "w-64 flex-shrink-0" : "w-full"} flex flex-col gap-3`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} border rounded-2xl p-4`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FaFilePdf className="text-red-400 text-lg" />
              <h3 className={`font-semibold text-sm ${textPrimary}`}>Upload Syllabus</h3>
            </div>
            {uploaded && (
              <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                <FaTrash className="text-[10px]" /> Reset
              </button>
            )}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f?.type === "application/pdf") setFile(f);
            }}
            onClick={() => !uploaded && document.getElementById("syllabus-input").click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
              uploaded ? "cursor-default opacity-60" :
              dragOver ? "border-purple-500 bg-purple-500/10 cursor-pointer" :
              isDarkMode
                ? "border-gray-600 hover:border-purple-500 hover:bg-purple-500/5 cursor-pointer"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer"
            }`}
          >
            <FaUpload className={`mx-auto mb-2 text-xl ${dragOver ? "text-purple-400" : textMuted}`} />
            {file ? (
              <p className="text-purple-400 text-xs font-medium truncate">📄 {file.name}</p>
            ) : (
              <>
                <p className={`text-xs font-medium ${textPrimary}`}>Drop PDF or click to browse</p>
                <p className={`text-xs mt-1 ${textMuted}`}>Max 10MB</p>
              </>
            )}
          </div>
          <input id="syllabus-input" type="file" accept=".pdf" className="hidden"
            onChange={(e) => setFile(e.target.files[0])} />

          {file && !uploaded && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-xs transition-all shadow-lg disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Syllabus"}
            </motion.button>
          )}

          {uploaded && (
            <div className="mt-2 flex items-center space-x-2 text-green-400 text-xs">
              <FaCheckCircle />
              <span>Ready! Ask questions →</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── RIGHT: Chat Panel (only shown after upload) ── */}
      <AnimatePresence>
        {uploaded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex-1 flex flex-col ${cardBg} border rounded-2xl overflow-hidden min-h-0`}
          >
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-700/40 flex items-center space-x-2 flex-shrink-0">
              <HiSparkles className="text-yellow-400" />
              <h3 className={`font-semibold text-sm ${textPrimary}`}>Ask About Your Syllabus</h3>
              {chatHistory.length > 0 && (
                <button
                  onClick={() => setChatHistory([])}
                  className={`ml-auto text-xs ${textMuted} hover:text-red-400 transition-colors`}
                >
                  Clear chat
                </button>
              )}
            </div>

            {/* Chat History */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${chatBg}`}>
              {chatHistory.length === 0 && (
                <div className={`text-center py-8 ${textMuted} text-xs`}>
                  <HiSparkles className="mx-auto mb-2 text-2xl text-purple-400 opacity-50" />
                  <p>Ask anything about your syllabus!</p>
                  <p className="mt-1 opacity-60">e.g. "What topics are in Unit 3?"</p>
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-600 to-purple-600"
                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                  }`}>
                    {msg.role === "user" ? <FaUser className="text-[10px]" /> : <FaRobot className="text-[10px]" />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-sm"
                      : isDarkMode
                        ? "bg-gray-700 text-gray-100 rounded-tl-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Loading bubble */}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs bg-gradient-to-br from-blue-500 to-cyan-500">
                    <FaRobot className="text-[10px]" />
                  </div>
                  <div className={`px-3 py-2.5 rounded-2xl rounded-tl-sm ${isDarkMode ? "bg-gray-700" : "bg-white border border-gray-200"}`}>
                    <div className="flex space-x-1.5">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className={`p-3 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex-shrink-0`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
                  placeholder="Ask about your syllabus..."
                  disabled={loading}
                  className={`flex-1 ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-50`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl disabled:opacity-50"
                >
                  <FaPaperPlane className="text-xs" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}