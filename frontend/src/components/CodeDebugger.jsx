/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaCode, FaBug, FaCopy, FaCheck } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useHistory } from "../hooks/useHistory";

const LANGUAGES = ["JavaScript","Python","Java","C++","C","PHP","SQL","HTML/CSS","React","Node.js"];

// ─── Markdown + Code Block Renderer ──────────────────────────
function MarkdownResult({ content, isDarkMode }) {
  const textColor    = isDarkMode ? "#f1f5f9" : "#0f172a";
  const mutedColor   = isDarkMode ? "#94a3b8" : "#64748b";
  const accentColor  = isDarkMode ? "#a78bfa" : "#7c3aed";
  const codeBg       = isDarkMode ? "#0f172a"  : "#1e293b";
  const inlineCodeBg = isDarkMode ? "rgba(139,92,246,0.18)" : "rgba(109,40,217,0.10)";
  const inlineCodeColor = isDarkMode ? "#c4b5fd" : "#5b21b6";

  // Render inline: **bold**, `code`, plain text
  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i} style={{ color: isDarkMode ? "#e2e8f0" : "#1e293b", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={i} style={{ background: inlineCodeBg, color: inlineCodeColor, padding: "1px 5px", borderRadius: 4, fontSize: "0.7rem", fontFamily: "monospace" }}>{part.slice(1, -1)}</code>;
      return part;
    });
  };

  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (!line.trim()) { i++; continue; }

    // Fenced code block ```lang ... ```
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().replace(/^```/, "").trim() || "code";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={`code-${i}`} style={{ margin: "10px 0", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(139,92,246,0.3)" }}>
          {/* Code block header */}
          <div style={{ background: "rgba(139,92,246,0.25)", padding: "4px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#a78bfa", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{lang}</span>
            <FaCode style={{ color: "#a78bfa", fontSize: "0.65rem" }} />
          </div>
          {/* Code body */}
          <pre style={{
            background: codeBg,
            color: "#86efac",
            margin: 0,
            padding: "12px",
            fontSize: "0.68rem",
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            lineHeight: 1.7,
            overflowX: "auto",
            whiteSpace: "pre",
          }}>
            {codeLines.join("\n")}
          </pre>
        </div>
      );
      continue;
    }

    // H1: # Title
    if (/^# /.test(line)) {
      elements.push(
        <h1 key={i} style={{ color: accentColor, fontSize: "1rem", fontWeight: 800, margin: "4px 0 6px", letterSpacing: "-0.01em" }}>
          {renderInline(line.slice(2))}
        </h1>
      );
      i++; continue;
    }

    // H2: ## Section
    if (/^## /.test(line)) {
      elements.push(
        <div key={i} style={{ marginTop: 14, marginBottom: 5 }}>
          <h2 style={{ color: accentColor, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            {renderInline(line.slice(3))}
          </h2>
          <div style={{ height: 1, background: `linear-gradient(to right, ${accentColor}55, transparent)`, marginTop: 3 }} />
        </div>
      );
      i++; continue;
    }

    // H3: ### Sub-section
    if (/^### /.test(line)) {
      elements.push(
        <h3 key={i} style={{ color: isDarkMode ? "#e2e8f0" : "#1e293b", fontSize: "0.72rem", fontWeight: 700, margin: "10px 0 3px" }}>
          {renderInline(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // Numbered list: 1. item
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const match = lines[i].match(/^(\d+)\.\s(.*)/);
        items.push({ num: match[1], text: match[2] });
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: "4px 0", paddingLeft: 0, listStyle: "none" }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
              <span style={{ flexShrink: 0, width: 18, height: 18, background: `linear-gradient(135deg, #7c3aed, #a855f7)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.6rem", fontWeight: 700, marginTop: 1 }}>{item.num}</span>
              <span style={{ color: textColor, fontSize: "0.72rem", lineHeight: 1.65 }}>{renderInline(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Bullet: - item or * item
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "3px 0", paddingLeft: 0, listStyle: "none" }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 2 }}>
              <span style={{ flexShrink: 0, color: accentColor, fontWeight: 700, fontSize: "0.8rem", lineHeight: 1.5 }}>›</span>
              <span style={{ color: textColor, fontSize: "0.72rem", lineHeight: 1.65 }}>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Bold-only line **Title**
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      elements.push(
        <p key={i} style={{ color: isDarkMode ? "#e2e8f0" : "#1e293b", fontSize: "0.75rem", fontWeight: 700, margin: "10px 0 3px" }}>
          {line.trim().slice(2, -2)}
        </p>
      );
      i++; continue;
    }

    // Horizontal rule ---
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} style={{ border: "none", borderTop: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`, margin: "10px 0" }} />);
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{ color: textColor, fontSize: "0.72rem", lineHeight: 1.7, margin: "2px 0" }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>{elements}</div>;
}

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
      history.save({
        title:   `${mode.charAt(0).toUpperCase() + mode.slice(1)}: ${language} — ${code.split("\n")[0].slice(0, 40)}`,
        preview: `${language} • ${mode} • ${code.split("\n").length} lines`,
        meta:    { Language: language, Mode: mode, Lines: `${code.split("\n").length}` },
        content: output,
      });
    } catch { setResult("❌ Failed to process code. Please try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Result panel background / border based on theme
  const resultBg     = isDarkMode ? "#0f172a" : "#f8fafc";
  const resultBorder = isDarkMode ? "#334155" : "#e2e8f0";

  return (
    <div className="space-y-3">
      {/* Mode selector */}
      <div className="grid grid-cols-4 gap-1.5">
        {MODES.map(m => (
          <motion.button key={m.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setMode(m.id)}
            className={`py-2 rounded-xl text-xs font-medium transition-all ${
              mode === m.id
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}>
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Code editor panel — always dark (editor aesthetic) */}
      <div className={`${cardBg} border rounded-2xl overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
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
          className="w-full bg-gray-900 text-green-400 px-4 py-3 text-xs font-mono focus:outline-none resize-none leading-relaxed placeholder-gray-600"
          spellCheck={false}
        />

        <div className="px-4 py-2 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
          <span className="text-gray-400 text-xs">{code.length} characters</span>
          <div className="flex gap-2">
            <button onClick={() => setCode("")} className="text-xs text-gray-400 hover:text-red-400 transition-colors">Clear</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit} disabled={loading || !code.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
              <HiSparkles className="text-xs" />
              {loading ? "Processing..." : MODES.find(m => m.id === mode)?.label}
            </motion.button>
          </div>
        </div>
      </div>

      {/* AI Analysis result */}
      {result && (
        <div
          className="border rounded-2xl overflow-hidden"
          style={{ borderColor: resultBorder }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, #1e1b4b, #312e81)"
                : "linear-gradient(135deg, #ede9fe, #ddd6fe)",
              borderBottom: `1px solid ${resultBorder}`,
            }}
          >
            <div className="flex items-center gap-2">
              <FaBug style={{ color: isDarkMode ? "#fb923c" : "#ea580c", fontSize: "0.75rem" }} />
              <span
                className="text-xs font-bold"
                style={{ color: isDarkMode ? "#c4b5fd" : "#5b21b6" }}
              >
                AI Analysis
              </span>
            </div>
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

          {/* Rendered markdown content */}
          <div
            className="p-4 overflow-y-auto"
            style={{
              background: resultBg,
              maxHeight: "520px",
            }}
          >
            <MarkdownResult content={result} isDarkMode={isDarkMode} />
          </div>
        </div>
      )}
    </div>
  );
}