/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaBrain, FaRedo, FaCheck, FaTimes } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useHistory } from "../hooks/useHistory";

export default function FlashcardGenerator({ isDarkMode }) {
  const [topic, setTopic]       = useState("");
  const [numCards, setNumCards] = useState(8);
  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [current, setCurrent]   = useState(0);
  const [flipped, setFlipped]   = useState(false);
  const [known, setKnown]       = useState([]);
  const [unknown, setUnknown]   = useState([]);
  const [finished, setFinished] = useState(false);
  const history                 = useHistory("flashcard");

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setCards([]); setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]); setFinished(false);
    try {
      const prompt = `Generate ${numCards} flashcards on the topic: "${topic}".
Return ONLY valid JSON array:
[{"id":1,"front":"Question or term","back":"Answer or definition"}]
No markdown, no explanation.`;
      const { data } = await axios.post("/api/chat/message", { message: prompt, chatId: null });
      const raw    = (data?.data?.message || "[]").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] || "[]");
      setCards(parsed);
    } catch { alert("Failed to generate flashcards. Try again."); }
    finally { setLoading(false); }
  };

  const handleKnow = (knows) => {
    const newKnown   = knows ? [...known, current]   : known;
    const newUnknown = knows ? unknown : [...unknown, current];
    if (knows) setKnown(newKnown);
    else setUnknown(newUnknown);
    setFlipped(false);

    if (current + 1 >= cards.length) {
      setFinished(true);
      // ✅ Save to history
      history.save({
        title:   `Flashcards: ${topic}`,
        preview: `${newKnown.length}/${cards.length} correct (${Math.round((newKnown.length / cards.length) * 100)}%)`,
        meta:    { Topic: topic, Cards: `${cards.length}`, Score: `${newKnown.length}/${cards.length}` },
        score:   newKnown.length,
        total:   cards.length,
      });
    } else {
      setTimeout(() => setCurrent(c => c + 1), 300);
    }
  };

  const restart      = () => { setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]); setFinished(false); };
  const reviewUnknown = () => {
    const missed = cards.filter((_, i) => unknown.includes(i));
    setCards(missed); setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]); setFinished(false);
  };

  return (
    <div className="space-y-4">
      <div className={`${cardBg} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center gap-2">
          <FaBrain className="text-purple-400" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>AI Flashcard Generator</h3>
        </div>
        <input placeholder="Topic (e.g. Database Normalization, OOP Concepts)"
          value={topic} onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          className={`w-full ${inputBg} px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
        />
        <div className="flex items-center gap-3">
          <label className={`text-xs ${textMuted}`}>Cards:</label>
          {[5,8,10,15].map(n => (
            <button key={n} onClick={() => setNumCards(n)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${numCards === n ? "bg-purple-600 text-white" : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
              {n}
            </button>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGenerate} disabled={loading || !topic.trim()}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          <HiSparkles /> {loading ? "Generating flashcards..." : "Generate Flashcards"}
        </motion.button>
      </div>

      {cards.length > 0 && !finished && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className={`text-xs ${textMuted}`}>{current+1} / {cards.length}</p>
            <div className="flex gap-2">
              <span className="text-xs text-green-400">✅ {known.length} known</span>
              <span className="text-xs text-red-400">❌ {unknown.length} learning</span>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600"
              style={{ width: `${(current / cards.length) * 100}%`, transition: "width 0.3s" }} />
          </div>

          <div style={{ perspective: "1000px" }}>
            <motion.div onClick={() => setFlipped(f => !f)}
              animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.4 }}
              style={{ transformStyle: "preserve-3d", cursor: "pointer", position: "relative", height: "200px" }}>
              <div style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0 }}
                className={`${cardBg} border rounded-2xl flex flex-col items-center justify-center p-6 text-center`}>
                <p className={`text-xs ${textMuted} mb-3`}>QUESTION</p>
                <p className={`text-base font-semibold ${textPrimary}`}>{cards[current]?.front}</p>
                <p className={`text-xs mt-4 ${textMuted}`}>Tap to reveal answer</p>
              </div>
              <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0 }}
                className="bg-gradient-to-br from-violet-600 to-purple-600 border border-purple-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xs text-white/70 mb-3">ANSWER</p>
                <p className="text-base font-semibold text-white">{cards[current]?.back}</p>
              </div>
            </motion.div>
          </div>

          {flipped && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleKnow(false)}
                className="flex-1 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <FaTimes /> Still Learning
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleKnow(true)}
                className="flex-1 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <FaCheck /> Got It!
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      {finished && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`${cardBg} border rounded-2xl p-6 text-center space-y-3`}>
          <p className="text-4xl">{known.length === cards.length ? "🎉" : known.length > cards.length / 2 ? "👍" : "📚"}</p>
          <p className={`text-xl font-bold ${textPrimary}`}>{known.length}/{cards.length} Cards Known</p>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
              style={{ width: `${(known.length / cards.length) * 100}%` }} />
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} onClick={restart}
              className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1">
              <FaRedo className="text-xs" /> Restart All
            </motion.button>
            {unknown.length > 0 && (
              <motion.button whileHover={{ scale: 1.02 }} onClick={reviewUnknown}
                className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold">
                Review {unknown.length} Missed
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}