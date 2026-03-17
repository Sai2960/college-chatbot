/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaFileAlt, FaCopy, FaCheck, FaDownload } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useHistory } from "../hooks/useHistory";

const TYPES   = ["Essay","Report","Research Paper","Assignment","Letter","Paragraph","Summary","Presentation Script"];
const LENGTHS = [{ label: "Short (300w)", value: 300 }, { label: "Medium (600w)", value: 600 }, { label: "Long (1000w)", value: 1000 }, { label: "Detailed (1500w)", value: 1500 }];
const TONES   = ["Academic","Professional","Formal","Informal","Creative","Persuasive","Analytical"];

export default function EssayWriter({ isDarkMode }) {
  const [form, setForm]       = useState({ topic: "", type: "Essay", length: 600, tone: "Academic", keywords: "", instructions: "" });
  const [essay, setEssay]     = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const wordCount             = essay.trim().split(/\s+/).filter(Boolean).length;
  const history               = useHistory("essay");

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const handleGenerate = async () => {
    if (!form.topic.trim()) return;
    setLoading(true); setEssay("");
    try {
      const prompt = `You are an expert academic writer. Write a ${form.tone.toLowerCase()} ${form.type.toLowerCase()} for a college student.

Topic: ${form.topic}
Type: ${form.type}
Tone: ${form.tone}
Target Length: approximately ${form.length} words
${form.keywords ? `Key Terms to Include: ${form.keywords}` : ""}
${form.instructions ? `Special Instructions: ${form.instructions}` : ""}

Write a complete, well-structured ${form.type} with:
- Proper introduction with thesis/objective
- Well-developed body paragraphs with clear arguments
- Strong conclusion
- Academic language appropriate for college level

Write the full ${form.type} now:`;

      const { data } = await axios.post("/api/chat/message", { message: prompt, chatId: null });
      const result = data?.data?.message || "Could not generate content.";
      setEssay(result);

      // ✅ Save to history
      history.save({
        title:   `${form.type}: ${form.topic.slice(0, 50)}`,
        preview: `${form.tone} • ~${form.length} words • ${form.type}`,
        meta:    { Type: form.type, Tone: form.tone, Length: `~${form.length}w` },
        content: result,
      });
    } catch { setEssay("❌ Failed to generate. Please try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(essay); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleDownload = () => {
    const blob = new Blob([essay], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${form.topic.slice(0, 30)}_${form.type}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center gap-2">
          <FaFileAlt className="text-blue-400" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>AI Essay & Assignment Writer</h3>
        </div>

        <input placeholder="Topic or title *" value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
        />

        <div className="grid grid-cols-2 gap-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}
            className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <p className={`text-xs ${textMuted} mb-1.5`}>Length</p>
          <div className="grid grid-cols-4 gap-1.5">
            {LENGTHS.map(l => (
              <button key={l.value} onClick={() => setForm({ ...form, length: l.value })}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${form.length === l.value ? "bg-purple-600 text-white" : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <input placeholder="Keywords to include (optional)" value={form.keywords}
          onChange={(e) => setForm({ ...form, keywords: e.target.value })}
          className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}
        />

        <textarea rows={2} placeholder="Special instructions (optional)" value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none resize-none`}
        />

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGenerate} disabled={loading || !form.topic.trim()}
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          <HiSparkles /> {loading ? "Writing your essay..." : `Generate ${form.type}`}
        </motion.button>
      </div>

      {essay && (
        <div className={`${cardBg} border rounded-2xl overflow-hidden`}>
          <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <p className={`text-xs font-semibold ${textPrimary}`}>{form.type} • ~{wordCount} words</p>
            <div className="flex gap-2">
              <button onClick={handleCopy}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg ${copied ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                {copied ? <FaCheck className="text-[10px]" /> : <FaCopy className="text-[10px]" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={handleDownload}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400">
                <FaDownload className="text-[10px]" /> Download
              </button>
            </div>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <p className={`text-sm ${textPrimary} whitespace-pre-wrap leading-relaxed`}>{essay}</p>
          </div>
        </div>
      )}
    </div>
  );
}