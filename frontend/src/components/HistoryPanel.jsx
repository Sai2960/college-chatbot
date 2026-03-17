/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHistory, FaTrash, FaCopy, FaCheck, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { useHistory } from "../hooks/useHistory";

const FEATURE_LABELS = {
  resume:    { label: "Resume Builder",     emoji: "📄", color: "text-green-400  bg-green-400/10  border-green-400/20"  },
  quiz:      { label: "Quiz Generator",     emoji: "🧠", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  flashcard: { label: "Flashcard Session",  emoji: "🃏", color: "text-pink-400   bg-pink-400/10   border-pink-400/20"   },
  essay:     { label: "Essay Writer",       emoji: "✍️", color: "text-blue-400   bg-blue-400/10   border-blue-400/20"   },
  debugger:  { label: "Code Debugger",      emoji: "🐛", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  study:     { label: "Study Plan",         emoji: "📅", color: "text-cyan-400   bg-cyan-400/10   border-cyan-400/20"   },
  interview: { label: "Interview Practice", emoji: "🎤", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  skillgap:  { label: "Skill Gap Analysis", emoji: "📊", color: "text-red-400    bg-red-400/10    border-red-400/20"    },
  syllabus:  { label: "Syllabus Q&A",       emoji: "📚", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
};

const ALL_KEYS = Object.keys(FEATURE_LABELS);

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function HistoryPanel({ isDarkMode, featureKey = null }) {
  const [activeFilter, setActiveFilter] = useState(featureKey || "all");
  const [allItems, setAllItems]         = useState([]);
  const [expanded, setExpanded]         = useState(null);
  const [copied, setCopied]             = useState(null);
  const [searchQuery, setSearchQuery]   = useState("");

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const loadAll = () => {
    const items = [];
    ALL_KEYS.forEach(key => {
      try {
        const stored = JSON.parse(localStorage.getItem(`history_${key}`) || "[]");
        stored.forEach(item => items.push({ ...item, featureKey: key }));
      } catch { /* silent */ }
    });
    items.sort((a, b) => b.id - a.id);
    setAllItems(items);
  };

  useEffect(() => { loadAll(); }, []);

  const handleRemove = (featureKey, id) => {
    const key     = `history_${featureKey}`;
    const stored  = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = stored.filter(i => i.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    loadAll();
  };

  const handleClearFeature = (fKey) => {
    if (!window.confirm(`Clear all ${FEATURE_LABELS[fKey]?.label} history?`)) return;
    localStorage.removeItem(`history_${fKey}`);
    loadAll();
  };

  const handleClearAll = () => {
    if (!window.confirm("Clear ALL history? This cannot be undone.")) return;
    ALL_KEYS.forEach(k => localStorage.removeItem(`history_${k}`));
    loadAll();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = allItems.filter(item => {
    const matchFilter = activeFilter === "all" || item.featureKey === activeFilter;
    const matchSearch = !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {};
  ALL_KEYS.forEach(k => { counts[k] = allItems.filter(i => i.featureKey === k).length; });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaHistory className="text-purple-400" />
          <h3 className={`font-bold text-sm ${textPrimary}`}>Activity History</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400`}>
            {allItems.length}
          </span>
        </div>
        {allItems.length > 0 && (
          <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-300">
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <input placeholder="🔍 Search history..." value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
      />

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setActiveFilter("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeFilter === "all"
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
          }`}>
          All ({allItems.length})
        </button>
        {ALL_KEYS.filter(k => counts[k] > 0).map(k => (
          <button key={k} onClick={() => setActiveFilter(k)}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === k
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}>
            {FEATURE_LABELS[k].emoji} {counts[k]}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className={`text-center py-10 ${textMuted}`}>
          <FaHistory className="mx-auto mb-3 text-3xl opacity-20" />
          <p className="text-sm font-medium">No history yet</p>
          <p className="text-xs mt-1 opacity-60">
            {activeFilter === "all" ? "Use any feature to see history here" : `No ${FEATURE_LABELS[activeFilter]?.label} history yet`}
          </p>
        </div>
      )}

      {/* History Items */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((item) => {
            const feat   = FEATURE_LABELS[item.featureKey];
            const isOpen = expanded === item.id;
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                className={`${cardBg} border rounded-2xl overflow-hidden`}>

                {/* Item Header */}
                <div className="flex items-start gap-2 p-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : item.id)}>
                  <span className="text-base flex-shrink-0 mt-0.5">{feat?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${feat?.color}`}>
                        {feat?.label}
                      </span>
                      <span className={`text-[10px] ${textMuted}`}>{formatTime(item.timestamp)}</span>
                    </div>
                    <p className={`text-xs font-semibold ${textPrimary} truncate`}>{item.title}</p>
                    {item.preview && (
                      <p className={`text-xs ${textMuted} truncate mt-0.5`}>{item.preview}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isOpen
                      ? <FaChevronUp className={`text-[10px] ${textMuted}`} />
                      : <FaChevronDown className={`text-[10px] ${textMuted}`} />
                    }
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className={`px-3 pb-3 border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>

                        {/* Meta Info */}
                        {item.meta && (
                          <div className="flex flex-wrap gap-1.5 py-2">
                            {Object.entries(item.meta).map(([k, v]) => (
                              <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Content */}
                        {item.content && (
                          <div className={`mt-2 p-2.5 rounded-xl text-xs ${textPrimary} whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                            {item.content}
                          </div>
                        )}

                        {/* Quiz specific */}
                        {item.questions && (
                          <div className="mt-2 space-y-1.5">
                            {item.questions.slice(0, 3).map((q, i) => (
                              <div key={i} className={`p-2 rounded-lg text-xs ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                <p className={`font-semibold ${textPrimary}`}>{i+1}. {q.question}</p>
                                <p className="text-green-400 mt-0.5">✓ {q.correctAnswer || q.answer}</p>
                              </div>
                            ))}
                            {item.questions.length > 3 && (
                              <p className={`text-xs ${textMuted} text-center`}>+{item.questions.length - 3} more questions</p>
                            )}
                          </div>
                        )}

                        {/* Flashcard specific */}
                        {item.score !== undefined && (
                          <div className={`mt-2 p-2.5 rounded-xl ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                            <p className={`text-xs font-semibold ${textPrimary}`}>
                              Score: <span className="text-green-400">{item.score}/{item.total}</span>
                              <span className={`ml-2 ${textMuted}`}>({Math.round((item.score/item.total)*100)}%)</span>
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {item.content && (
                            <button onClick={() => handleCopy(item.content, item.id)}
                              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg ${copied === item.id ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                              {copied === item.id ? <FaCheck className="text-[10px]" /> : <FaCopy className="text-[10px]" />}
                              {copied === item.id ? "Copied!" : "Copy"}
                            </button>
                          )}
                          <button onClick={() => handleRemove(item.featureKey, item.id)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 ml-auto">
                            <FaTrash className="text-[10px]" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}