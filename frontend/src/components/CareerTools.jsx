/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaFileAlt, FaMicrophone, FaBriefcase, FaChartBar, FaCopy, FaCheck } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useHistory } from "../hooks/useHistory";

const TABS = [
  { id: "resume",    label: "Resume",    icon: FaFileAlt,    color: "text-green-400"  },
  { id: "interview", label: "Interview", icon: FaMicrophone, color: "text-blue-400"   },
  { id: "jobs",      label: "Jobs",      icon: FaBriefcase,  color: "text-yellow-400" },
  { id: "skillgap",  label: "Skill Gap", icon: FaChartBar,   color: "text-red-400"    },
];

// ─── Markdown Renderer ────────────────────────────────────────
function MarkdownResume({ content, isDarkMode }) {
  const textColor = isDarkMode ? "#f1f5f9" : "#0f172a";
  const mutedColor = isDarkMode ? "#94a3b8" : "#64748b";
  const borderColor = isDarkMode ? "#334155" : "#e2e8f0";
  const sectionBg = isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
  const accentColor = isDarkMode ? "#a78bfa" : "#7c3aed";

  const lines = content.split("\n");

  const renderInline = (text) => {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: isDarkMode ? "#e2e8f0" : "#1e293b", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      // Handle markdown links [text](url) — strip to just text
      const linkMatch = part.match(/\[([^\]]+)\]\([^)]+\)/g);
      if (linkMatch) {
        return part.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      }
      return part;
    });
  };

  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) { i++; continue; }

    // H1: # Title
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} style={{ color: accentColor, fontSize: "1.25rem", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
          {line.slice(2)}
        </h1>
      );
      i++; continue;
    }

    // H2: ## Section
    if (line.startsWith("## ")) {
      elements.push(
        <div key={i} style={{ marginTop: "16px", marginBottom: "6px" }}>
          <h2 style={{ color: accentColor, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            {line.slice(3)}
          </h2>
          <div style={{ height: "1px", background: `linear-gradient(to right, ${accentColor}60, transparent)`, marginTop: "3px" }} />
        </div>
      );
      i++; continue;
    }

    // H3: ### Sub-section
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{ color: isDarkMode ? "#e2e8f0" : "#1e293b", fontSize: "0.75rem", fontWeight: 700, margin: "8px 0 2px 0" }}>
          {renderInline(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // Bold-only line: **Section Title**
    if (line.startsWith("**") && line.endsWith("**") && !line.slice(2, -2).includes("**")) {
      elements.push(
        <p key={i} style={{ color: isDarkMode ? "#e2e8f0" : "#1e293b", fontSize: "0.75rem", fontWeight: 700, margin: "10px 0 3px 0" }}>
          {line.slice(2, -2)}
        </p>
      );
      i++; continue;
    }

    // Bullet: - item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const bulletItems = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        bulletItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "3px 0 3px 0", paddingLeft: "14px", listStyle: "none" }}>
          {bulletItems.map((item, j) => (
            <li key={j} style={{ color: textColor, fontSize: "0.72rem", lineHeight: "1.6", position: "relative", paddingLeft: "10px", marginBottom: "1px" }}>
              <span style={{ position: "absolute", left: 0, color: accentColor, fontWeight: 700 }}>›</span>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Contact info line (contains | separators or email/phone patterns)
    if (line.includes("|") || line.includes("@") || line.match(/\d{3}[-.\s]\d{3}/)) {
      elements.push(
        <p key={i} style={{ color: mutedColor, fontSize: "0.68rem", margin: "2px 0", textAlign: "center" }}>
          {line.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}
        </p>
      );
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{ color: textColor, fontSize: "0.72rem", lineHeight: "1.65", margin: "2px 0" }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return (
    <div style={{ fontFamily: "'Georgia', serif", padding: "4px 2px" }}>
      {elements}
    </div>
  );
}

export default function CareerTools({ isDarkMode }) {
  const [activeTab, setActiveTab] = useState("resume");
  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400" : "bg-gray-100 text-gray-900 border-gray-300 placeholder-gray-500";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-1.5 flex-shrink-0">
        {TABS.map((tab) => (
          <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                : isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            <tab.icon className={`text-sm mb-1 ${activeTab === tab.id ? "text-white" : tab.color}`} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="flex-1 overflow-y-auto">
          {activeTab === "resume"    && <ResumeBuilder    isDarkMode={isDarkMode} cardBg={cardBg} inputBg={inputBg} textPrimary={textPrimary} textMuted={textMuted} />}
          {activeTab === "interview" && <InterviewPractice isDarkMode={isDarkMode} cardBg={cardBg} inputBg={inputBg} textPrimary={textPrimary} textMuted={textMuted} />}
          {activeTab === "jobs"      && <JobSuggestions   isDarkMode={isDarkMode} cardBg={cardBg} inputBg={inputBg} textPrimary={textPrimary} textMuted={textMuted} />}
          {activeTab === "skillgap"  && <SkillGapAnalyzer isDarkMode={isDarkMode} cardBg={cardBg} inputBg={inputBg} textPrimary={textPrimary} textMuted={textMuted} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Resume Builder ───────────────────────────────────────────
function ResumeBuilder({ isDarkMode, cardBg, inputBg, textPrimary, textMuted }) {
  const [form, setForm]       = useState({ name: "", course: "BCA", semester: "6", skills: "", projects: "", experience: "", targetRole: "" });
  const [resume, setResume]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const history               = useHistory("resume");

  const handleGenerate = async () => {
    if (!form.name || !form.course) return;
    setLoading(true); setResume("");
    try {
      const { data } = await axios.post("/api/career/resume", form);
      const result = data.data.resume;
      setResume(result);
      history.save({
        title:   `Resume: ${form.name} — ${form.targetRole || form.course}`,
        preview: `${form.course} • Sem ${form.semester} • ${form.targetRole || "General"}`,
        meta:    { Name: form.name, Course: form.course, Semester: `Sem ${form.semester}`, Role: form.targetRole || "—" },
        content: result,
      });
    } catch { setResume("❌ Failed to generate resume. Please try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(resume); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const resumeBg    = isDarkMode ? "#1e293b" : "#f8fafc";
  const resumeBorder = isDarkMode ? "#334155" : "#e2e8f0";

  return (
    <div className="space-y-3">
      <div className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center space-x-2">
          <FaFileAlt className="text-green-400" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>AI Resume Builder</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[{ key: "name", placeholder: "Your Full Name *" }, { key: "targetRole", placeholder: "Target Role (e.g. Dev)" }].map(({ key, placeholder }) => (
            <input key={key} placeholder={placeholder} value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}
            className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}>
            {["BCA","MCA","B.Tech","M.Tech","BSc IT","MSc IT"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}
            className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}>
            {["1","2","3","4","5","6","Final Year"].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>
        {[{ key: "skills", placeholder: "Skills (e.g. Python, React, MySQL)" }, { key: "projects", placeholder: "Projects (e.g. College chatbot using React)" }, { key: "experience", placeholder: "Internships/Experience (optional)" }].map(({ key, placeholder }) => (
          <textarea key={key} rows={2} placeholder={placeholder} value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none resize-none`}
          />
        ))}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGenerate} disabled={loading || !form.name}
          className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          <HiSparkles /> {loading ? "Generating..." : "Generate Resume"}
        </motion.button>
      </div>

      {resume && (
        <div
          className="border rounded-2xl overflow-hidden"
          style={{ borderColor: resumeBorder }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, #1e1b4b, #312e81)"
                : "linear-gradient(135deg, #ede9fe, #ddd6fe)",
              borderBottom: `1px solid ${resumeBorder}`,
            }}
          >
            <div className="flex items-center gap-2">
              <FaFileAlt className={isDarkMode ? "text-violet-300" : "text-violet-600"} />
              <span
                className="text-xs font-bold"
                style={{ color: isDarkMode ? "#c4b5fd" : "#5b21b6" }}
              >
                Your Resume
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-medium transition-all"
                style={{
                  background: copied
                    ? isDarkMode ? "rgba(34,197,94,0.2)" : "rgba(22,163,74,0.15)"
                    : isDarkMode ? "rgba(139,92,246,0.25)" : "rgba(109,40,217,0.12)",
                  color: copied
                    ? isDarkMode ? "#86efac" : "#166534"
                    : isDarkMode ? "#c4b5fd" : "#5b21b6",
                }}
              >
                {copied ? <FaCheck className="text-[10px]" /> : <FaCopy className="text-[10px]" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Resume content */}
          <div
            className="p-4 overflow-y-auto"
            style={{
              background: resumeBg,
              maxHeight: "520px",
            }}
          >
            <MarkdownResume content={resume} isDarkMode={isDarkMode} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Interview Practice ───────────────────────────────────────
function InterviewPractice({ isDarkMode, cardBg, inputBg, textPrimary, textMuted }) {
  const [form, setForm]           = useState({ role: "", course: "BCA", difficulty: "medium", type: "mixed" });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [expanded, setExpanded]   = useState(null);
  const history                   = useHistory("interview");

  const handleGenerate = async () => {
    if (!form.role) return;
    setLoading(true); setQuestions([]);
    try {
      const { data } = await axios.post("/api/career/interview", form);
      const qs = data.data.questions;
      setQuestions(qs);
      history.save({
        title:     `Interview: ${form.role}`,
        preview:   `${form.difficulty} • ${form.type} • ${qs.length} questions`,
        meta:      { Role: form.role, Difficulty: form.difficulty, Type: form.type, Questions: `${qs.length}` },
        questions: qs,
      });
    } catch { alert("Failed to generate questions."); }
    finally { setLoading(false); }
  };

  const categoryColor = {
    technical:   isDarkMode ? "text-blue-300 bg-blue-500/20"   : "text-blue-700 bg-blue-100",
    hr:          isDarkMode ? "text-green-300 bg-green-500/20" : "text-green-700 bg-green-100",
    situational: isDarkMode ? "text-yellow-300 bg-yellow-500/20" : "text-yellow-700 bg-yellow-100",
  };

  return (
    <div className="space-y-3">
      <div className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center space-x-2">
          <FaMicrophone className="text-blue-400" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>Mock Interview</h3>
        </div>
        <input placeholder="Target Role (e.g. Frontend Developer) *" value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
        />
        <div className="grid grid-cols-3 gap-2">
          <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}
            className={`${inputBg} px-2 py-2 rounded-xl text-xs border focus:outline-none`}>
            {["BCA","MCA","B.Tech","M.Tech"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className={`${inputBg} px-2 py-2 rounded-xl text-xs border focus:outline-none`}>
            {["easy","medium","hard"].map(d => <option key={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
          </select>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={`${inputBg} px-2 py-2 rounded-xl text-xs border focus:outline-none`}>
            {["mixed","technical","hr"].map(t => <option key={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGenerate} disabled={loading || !form.role}
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          <HiSparkles /> {loading ? "Generating questions..." : "Generate Interview Questions"}
        </motion.button>
      </div>

      {questions.map((q, i) => (
        <motion.div key={q.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className={`${cardBg} border rounded-2xl overflow-hidden`}>
          <button onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full p-3 text-left flex items-start gap-2">
            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[q.category] || (isDarkMode ? "text-purple-300 bg-purple-500/20" : "text-purple-700 bg-purple-100")}`}>
              {q.category}
            </span>
            <p className={`text-xs font-semibold ${textPrimary} flex-1`}>{i+1}. {q.question}</p>
          </button>
          <AnimatePresence>
            {expanded === i && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                className={`overflow-hidden border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div className="p-3 space-y-2">
                  <div className={`rounded-xl p-2.5 ${isDarkMode ? "bg-blue-900/40" : "bg-blue-50"}`}>
                    <p className={`text-xs font-semibold mb-1 ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>👀 What they're looking for:</p>
                    <p className={`text-xs ${isDarkMode ? "text-blue-100" : "text-blue-900"}`}>{q.lookingFor}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${isDarkMode ? "bg-green-900/40" : "bg-green-50"}`}>
                    <p className={`text-xs font-semibold mb-1 ${isDarkMode ? "text-green-300" : "text-green-700"}`}>✅ Model Answer:</p>
                    <p className={`text-xs ${isDarkMode ? "text-green-100" : "text-green-900"}`}>{q.modelAnswer}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${isDarkMode ? "bg-yellow-900/40" : "bg-yellow-50"}`}>
                    <p className={`text-xs font-semibold mb-1 ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}>💡 Tip:</p>
                    <p className={`text-xs ${isDarkMode ? "text-yellow-100" : "text-yellow-900"}`}>{q.tip}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Job Suggestions ──────────────────────────────────────────
function JobSuggestions({ isDarkMode, cardBg, inputBg, textPrimary, textMuted }) {
  const [form, setForm]       = useState({ course: "BCA", skills: "", semester: "Final Year", interests: "" });
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState("internships");

  const handleFetch = async () => {
    setLoading(true); setData(null);
    try {
      const res = await axios.post("/api/career/jobs", form);
      setData(res.data.data);
    } catch { alert("Failed to fetch suggestions."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <div className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center space-x-2">
          <FaBriefcase className="text-yellow-400" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>Job & Internship Finder</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}
            className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}>
            {["BCA","MCA","B.Tech","M.Tech","BSc IT"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}
            className={`${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}>
            {["1st Year","2nd Year","3rd Year","Final Year"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <input placeholder="Your skills (e.g. React, Python, SQL)" value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}
        />
        <input placeholder="Interests (e.g. Web dev, AI, Data Science)" value={form.interests}
          onChange={(e) => setForm({ ...form, interests: e.target.value })}
          className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}
        />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleFetch} disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          <HiSparkles /> {loading ? "Finding opportunities..." : "Find Jobs & Internships"}
        </motion.button>
      </div>

      {data && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {["internships","fulltime_jobs"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${tab === t ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                {t === "internships" ? "🎓 Internships" : "💼 Full-time"}
              </button>
            ))}
          </div>
          {(data[tab] || []).map((job, i) => (
            <div key={i} className={`${cardBg} border rounded-2xl p-3 space-y-2`}>
              <p className={`text-sm font-bold ${textPrimary}`}>{job.role}</p>
              <div className="flex flex-wrap gap-1">
                {job.skills_needed?.map((s, j) => (
                  <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"}`}>{s}</span>
                ))}
              </div>
              <p className={`text-xs ${textMuted}`}>🏢 {job.companies?.join(", ")} | {tab === "internships" ? `💰 ${job.stipend}` : `💰 ${job.salary_range}`}</p>
              <div className="flex flex-wrap gap-1">
                {job.where_to_apply?.map((w, j) => (
                  <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"}`}>📍 {w}</span>
                ))}
              </div>
            </div>
          ))}
          {data.tips?.length > 0 && (
            <div className={`${cardBg} border rounded-2xl p-3`}>
              <p className={`text-xs font-bold mb-2 ${textPrimary}`}>💡 Tips</p>
              {data.tips.map((tip, i) => <p key={i} className={`text-xs ${textMuted} mb-1`}>• {tip}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skill Gap Analyzer ───────────────────────────────────────
function SkillGapAnalyzer({ isDarkMode, cardBg, inputBg, textPrimary, textMuted }) {
  const [form, setForm]       = useState({ targetRole: "", currentSkills: "", course: "BCA" });
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const history               = useHistory("skillgap");

  const handleAnalyze = async () => {
    if (!form.targetRole) return;
    setLoading(true); setData(null);
    try {
      const res = await axios.post("/api/career/skillgap", form);
      const result = res.data.data;
      setData(result);
      history.save({
        title:   `Skill Gap: ${form.targetRole}`,
        preview: `Readiness: ${result.readinessScore}% • ${result.estimatedTimeToReady} to job-ready`,
        meta:    { Role: form.targetRole, Score: `${result.readinessScore}%`, Time: result.estimatedTimeToReady },
        content: `Missing skills: ${result.missingSkills?.map(s => `${s.skill} (${s.priority})`).join(", ")}`,
      });
    } catch { alert("Failed to analyze skill gap."); }
    finally { setLoading(false); }
  };

  const priorityColor = {
    high:   isDarkMode ? "text-red-300 bg-red-900/40 border-red-500/30"    : "text-red-700 bg-red-50 border-red-200",
    medium: isDarkMode ? "text-yellow-300 bg-yellow-900/40 border-yellow-500/30" : "text-yellow-700 bg-yellow-50 border-yellow-200",
    low:    isDarkMode ? "text-green-300 bg-green-900/40 border-green-500/30"  : "text-green-700 bg-green-50 border-green-200",
  };

  const barColor = (score) => score >= 70 ? (isDarkMode ? "#4ade80" : "#16a34a") : score >= 40 ? (isDarkMode ? "#facc15" : "#ca8a04") : (isDarkMode ? "#f87171" : "#dc2626");

  return (
    <div className="space-y-3">
      <div className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center space-x-2">
          <FaChartBar className="text-red-400" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>Skill Gap Analyzer</h3>
        </div>
        <input placeholder="Target Role (e.g. Full Stack Developer) *"
          value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
          className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
        />
        <textarea rows={2} placeholder="Your current skills (e.g. HTML, CSS, basic JavaScript)"
          value={form.currentSkills} onChange={(e) => setForm({ ...form, currentSkills: e.target.value })}
          className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none resize-none`}
        />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze} disabled={loading || !form.targetRole}
          className="w-full py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          <HiSparkles /> {loading ? "Analyzing..." : "Analyze My Skill Gap"}
        </motion.button>
      </div>

      {data && (
        <div className="space-y-3">
          <div className={`${cardBg} border rounded-2xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-bold ${textPrimary}`}>Readiness Score</p>
              <span className="text-lg font-bold" style={{ color: barColor(data.readinessScore) }}>{data.readinessScore}%</span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
              <div className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${data.readinessScore}%`, background: barColor(data.readinessScore) }} />
            </div>
            <p className={`text-xs mt-2 ${textMuted}`}>⏱ {data.estimatedTimeToReady} to be job-ready</p>
          </div>

          <div className={`${cardBg} border rounded-2xl p-3`}>
            <p className={`text-xs font-bold mb-2 ${textPrimary}`}>🚨 Skills to Learn</p>
            <div className="space-y-2">
              {data.missingSkills?.map((s, i) => (
                <div key={i} className={`border rounded-xl p-2.5 ${priorityColor[s.priority] || priorityColor.medium}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold">{s.skill}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${priorityColor[s.priority] || priorityColor.medium}`}>{s.priority}</span>
                  </div>
                  <p className={`text-xs mt-1 ${textMuted}`}>⏱ {s.timeToLearn}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.resources?.map((r, j) => (
                      <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDarkMode ? "bg-white/10 text-gray-300" : "bg-gray-200 text-gray-700"}`}>{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.learningPath?.length > 0 && (
            <div className={`${cardBg} border rounded-2xl p-3`}>
              <p className={`text-xs font-bold mb-2 ${textPrimary}`}>🗺 Learning Path</p>
              {data.learningPath.map((month, i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{month.month}</div>
                  <div>
                    <p className={`text-xs font-semibold ${textPrimary}`}>{month.focus}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {month.skills?.map((s, j) => (
                        <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDarkMode ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"}`}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}