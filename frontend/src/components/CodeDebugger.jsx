/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaCode, FaBug, FaCopy, FaCheck } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useHistory } from "../hooks/useHistory";

const LANGUAGES = ["JavaScript","Python","Java","C++","C","PHP","SQL","HTML/CSS","React","Node.js"];

export default function CodeDebugger({ isDarkMode }) {
  const [code, setCode]         = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [mode, setMode]         = useState("debug");
  const [result, setResult]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const history                 = useHistory("debugger");

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const MODES = [
    { id: "debug",    label: "🐛 Debug",    prompt: (lang, code) => `You are an expert ${lang} debugger. Analyze this code, find ALL bugs, and provide the fixed version.\n\nCode:\n\`\`\`${lang}\n${code}\n\`\`\`\n\nProvide:\n1. **Bugs Found** (list each bug with line reference)\n2. **Fixed Code** (complete working version)\n3. **Explanation** (what was wrong and why)` },
    { id: "explain",  label: "📖 Explain",  prompt: (lang, code) => `Explain this ${lang} code line by line in simple terms for a college student.\n\nCode:\n\`\`\`${lang}\n${code}\n\`\`\`\n\nProvide:\n1. **Overall Purpose**\n2. **Line-by-line explanation**\n3. **Key concepts used**` },
    { id: "optimize", label: "⚡ Optimize", prompt: (lang, code) => `Optimize this ${lang} code for better performance and readability.\n\nCode:\n\`\`\`${lang}\n${code}\n\`\`\`\n\nProvide:\n1. **Issues with current code**\n2. **Optimized version**\n3. **What improved and why**` },
    { id: "convert",  label: "🔄 Convert",  prompt: (lang, code) => `Convert this ${lang} code to Python (if not Python) or JavaScript (if Python).\n\nCode:\n\`\`\`${lang}\n${code}\n\`\`\`\n\nProvide the complete converted code with brief notes on differences.` },
  ];

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setLoading(true); setResult("");
    const selectedMode = MODES.find(m => m.id === mode);
    try {
      const { data } = await axios.post("/api/chat/message", {
        message: selectedMode.prompt(language, code),
        chatId: null,
      });
      const output = data?.data?.message || "No response generated.";
      setResult(output);

      // ✅ Save to history
      history.save({
        title:   `${mode.charAt(0).toUpperCase() + mode.slice(1)}: ${language} — ${code.split("\n")[0].slice(0, 40)}`,
        preview: `${language} • ${mode} • ${code.split("\n").length} lines`,
        meta:    { Language: language, Mode: mode, Lines: `${code.split("\n").length}` },
        content: output,
      });
    } catch { setResult("❌ Failed to process code. Please try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1.5">
        {MODES.map(m => (
          <motion.button key={m.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setMode(m.id)}
            className={`py-2 rounded-xl text-xs font-medium transition-all ${
              mode === m.id ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" :
              isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}>
            {m.label}
          </motion.button>
        ))}
      </div>

      <div className={`${cardBg} border rounded-2xl overflow-hidden`}>
        <div className={`flex items-center justify-between px-4 py-2 ${isDarkMode ? "bg-gray-900" : "bg-gray-800"}`}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-lg border-0 focus:outline-none">
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
          <div className="flex items-center gap-1.5">
            <FaCode className="text-green-400 text-xs" />
            <span className="text-gray-400 text-xs">{code.split("\n").length} lines</span>
          </div>
        </div>

        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={10}
          placeholder={`// Paste your ${language} code here...\n// I'll debug, explain, optimize or convert it!`}
          className="w-full bg-gray-900 text-green-400 px-4 py-3 text-xs font-mono focus:outline-none resize-none leading-relaxed"
          spellCheck={false}
        />

        <div className="px-4 py-2 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
          <span className="text-gray-400 text-xs">{code.length} characters</span>
          <div className="flex gap-2">
            <button onClick={() => setCode("")} className="text-xs text-gray-400 hover:text-red-400">Clear</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit} disabled={loading || !code.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
              <HiSparkles className="text-xs" />
              {loading ? "Processing..." : MODES.find(m => m.id === mode)?.label}
            </motion.button>
          </div>
        </div>
      </div>

      {result && (
        <div className={`${cardBg} border rounded-2xl overflow-hidden`}>
          <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center gap-2">
              <FaBug className="text-orange-400 text-xs" />
              <span className={`text-xs font-semibold ${textPrimary}`}>AI Analysis</span>
            </div>
            <button onClick={handleCopy}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${copied ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
              {copied ? <FaCheck className="text-[10px]" /> : <FaCopy className="text-[10px]" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-4">
            <pre className={`text-xs ${textPrimary} whitespace-pre-wrap font-sans leading-relaxed`}>{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
}