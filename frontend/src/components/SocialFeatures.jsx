/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FaUsers, FaTrophy, FaPlus, FaPaperPlane,
  FaTrash, FaSignInAlt, FaBell, FaBellSlash,
  FaCircle, FaCheck, FaCheckDouble,
} from "react-icons/fa";

const TABS = [
  { id: "rooms",       label: "Study Rooms", icon: FaUsers  },
  { id: "leaderboard", label: "Leaderboard", icon: FaTrophy },
];

// ─── Exported hook so Chat.jsx can show total unread badge ────
export function useSocialUnread() {
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadMap, setUnreadMap]     = useState({});   // roomId → count

  const updateUnread = useCallback((roomId, count) => {
    setUnreadMap(prev => {
      const next = { ...prev, [roomId]: count };
      setTotalUnread(Object.values(next).reduce((a, b) => a + b, 0));
      return next;
    });
  }, []);

  const clearUnread = useCallback((roomId) => {
    setUnreadMap(prev => {
      const next = { ...prev, [roomId]: 0 };
      setTotalUnread(Object.values(next).reduce((a, b) => a + b, 0));
      return next;
    });
  }, []);

  return { totalUnread, unreadMap, updateUnread, clearUnread };
}

// ─── Main Component ───────────────────────────────────────────
export default function SocialFeatures({ isDarkMode, onUnreadChange }) {
  const [activeTab, setActiveTab] = useState("rooms");
  const { totalUnread, unreadMap, updateUnread, clearUnread } = useSocialUnread();

  // bubble up total unread to Chat.jsx for the toolbar badge
  useEffect(() => {
    if (onUnreadChange) onUnreadChange(totalUnread);
  }, [totalUnread, onUnreadChange]);

  const cardBg      = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const inputBg     = isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-900 border-gray-300";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted   = isDarkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Tabs */}
      <div className="flex gap-2 flex-shrink-0">
        {TABS.map((tab) => (
          <motion.button key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                : isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}>
            <tab.icon className="text-sm" />
            {tab.label}
            {/* Unread badge on Study Rooms tab */}
            {tab.id === "rooms" && totalUnread > 0 && activeTab !== "rooms" && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} className="flex-1 overflow-y-auto">
          {activeTab === "rooms" && (
            <StudyRooms
              isDarkMode={isDarkMode} cardBg={cardBg} inputBg={inputBg}
              textPrimary={textPrimary} textMuted={textMuted}
              unreadMap={unreadMap} updateUnread={updateUnread} clearUnread={clearUnread}
            />
          )}
          {activeTab === "leaderboard" && (
            <Leaderboard isDarkMode={isDarkMode} cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Study Rooms ──────────────────────────────────────────────
function StudyRooms({ isDarkMode, cardBg, inputBg, textPrimary, textMuted, unreadMap, updateUnread, clearUnread }) {
  const { user } = useAuth();
  const [rooms, setRooms]           = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [newMsg, setNewMsg]         = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]             = useState({ name: "", subject: "General" });
  const [loading, setLoading]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [lastSeenMap, setLastSeenMap] = useState({});   // roomId → last message index seen
  const messagesEndRef              = useRef(null);
  const pollRef                     = useRef(null);
  const roomPollRef                 = useRef(null);     // poll rooms list for unread counts

  // ── Current user id ──
  const currentUserId = user?._id || user?.id || "";
  const currentUserName = user?.displayName || user?.name || user?.username || "";

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/social/rooms");
      setRooms(data.data);
    } catch { /* silent */ }
  }, []);

  const fetchMessages = useCallback(async (roomId, silent = false) => {
    try {
      const { data } = await axios.get(`/api/social/rooms/${roomId}/messages`);
      const msgs = data.data;

      setMessages(prev => {
        // Calculate unread: messages after lastSeen that aren't from current user
        if (activeRoom?._id === roomId) {
          // Room is open → all read → scroll to bottom
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          clearUnread(roomId);
          return msgs;
        }
        // Room not open → count new messages not from me
        const lastSeen = lastSeenMap[roomId] ?? 0;
        const unread = msgs.slice(lastSeen).filter(m => {
          const senderId = m.userId?.toString?.() ?? m.userId;
          return senderId !== currentUserId;
        }).length;
        updateUnread(roomId, unread);
        return prev;
      });

      return msgs;
    } catch { return []; }
  }, [activeRoom, clearUnread, updateUnread, lastSeenMap, currentUserId]);

  // Initial load
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // Poll rooms list every 8s to update unread badges
  useEffect(() => {
    roomPollRef.current = setInterval(() => {
      rooms.forEach(r => {
        if (activeRoom?._id !== r._id) fetchMessages(r._id, true);
      });
    }, 8000);
    return () => clearInterval(roomPollRef.current);
  }, [rooms, activeRoom, fetchMessages]);

  // Active room polling
  useEffect(() => {
    if (activeRoom) {
      // Immediate fetch + scroll
      fetchMessages(activeRoom._id).then(msgs => {
        if (msgs) {
          setMessages(msgs);
          clearUnread(activeRoom._id);
          setLastSeenMap(prev => ({ ...prev, [activeRoom._id]: msgs.length }));
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      });
      pollRef.current = setInterval(async () => {
        const msgs = await fetchMessages(activeRoom._id);
        if (msgs?.length) {
          setMessages(msgs);
          clearUnread(activeRoom._id);
          setLastSeenMap(prev => ({ ...prev, [activeRoom._id]: msgs.length }));
        }
      }, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeRoom?._id]); // eslint-disable-line

  const handleCreate = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      await axios.post("/api/social/rooms", form);
      setForm({ name: "", subject: "General" });
      setShowCreate(false);
      fetchRooms();
    } catch { alert("Failed to create room"); }
    finally { setLoading(false); }
  };

  const handleJoin = async (room) => {
    try { await axios.post(`/api/social/rooms/${room._id}/join`); } catch { /* silent */ }
    setActiveRoom(room);
    clearUnread(room._id);
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !activeRoom || sending) return;
    const text = newMsg.trim();
    setNewMsg("");
    setSending(true);

    // Optimistic UI
    const optimistic = {
      userId: currentUserId,
      userName: currentUserName,
      text,
      timestamp: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      await axios.post(`/api/social/rooms/${activeRoom._id}/message`, { text });
      const msgs = await fetchMessages(activeRoom._id);
      if (msgs) {
        setMessages(msgs);
        setLastSeenMap(prev => ({ ...prev, [activeRoom._id]: msgs.length }));
      }
    } catch { alert("Failed to send message"); }
    finally { setSending(false); }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await axios.delete(`/api/social/rooms/${roomId}`);
      if (activeRoom?._id === roomId) setActiveRoom(null);
      fetchRooms();
    } catch { alert("Not authorized to delete"); }
  };

  // ── Check if a message is from the current user ──
  const isMine = (msg) => {
    if (!msg) return false;
    const senderId = msg.userId?.toString?.() ?? msg.userId ?? "";
    if (senderId && currentUserId && senderId === currentUserId) return true;
    // Fallback: match by name
    if (msg.userName && currentUserName && msg.userName === currentUserName) return true;
    return false;
  };

  // ── Avatar colour from name ──
  const avatarColor = (name = "") => {
    const colors = [
      "linear-gradient(135deg,#667eea,#764ba2)",
      "linear-gradient(135deg,#f093fb,#f5576c)",
      "linear-gradient(135deg,#4facfe,#00f2fe)",
      "linear-gradient(135deg,#43e97b,#38f9d7)",
      "linear-gradient(135deg,#fa709a,#fee140)",
      "linear-gradient(135deg,#a18cd1,#fbc2eb)",
      "linear-gradient(135deg,#fccb90,#d57eeb)",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // ═══════════════════════════════════════════════════════
  // ACTIVE ROOM VIEW
  // ═══════════════════════════════════════════════════════
  if (activeRoom) {
    return (
      <div className={`flex flex-col h-[460px] ${isDarkMode ? "bg-gray-800/80" : "bg-white"} rounded-2xl overflow-hidden border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>

        {/* Room Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-white font-semibold text-sm"># {activeRoom.name}</p>
            <p className="text-white/70 text-xs">{activeRoom.subject} • {activeRoom.members?.length || 0} members</p>
          </div>
          <button
            onClick={() => { setActiveRoom(null); clearInterval(pollRef.current); }}
            className="text-white/80 hover:text-white text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.length === 0 && (
            <p className={`text-center text-xs ${textMuted} py-10`}>No messages yet. Say hello! 👋</p>
          )}

          {messages.map((msg, i) => {
            const mine = isMine(msg);
            const prevMsg = messages[i - 1];
            const sameSender = prevMsg && prevMsg.userName === msg.userName;
            const showAvatar = !mine && !sameSender;
            const showName   = !mine && !sameSender;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"} ${sameSender ? "mt-0.5" : "mt-3"}`}
              >
                {/* Avatar (other users only) */}
                {!mine && (
                  <div className="w-7 h-7 flex-shrink-0 mb-0.5">
                    {showAvatar ? (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: avatarColor(msg.userName || "") }}
                      >
                        {msg.userName?.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-7 h-7" /> // spacer
                    )}
                  </div>
                )}

                <div className={`flex flex-col max-w-[72%] ${mine ? "items-end" : "items-start"}`}>
                  {/* Name label */}
                  {showName && (
                    <p className={`text-[10px] font-semibold mb-0.5 ml-1 ${textMuted}`}>
                      {msg.userName}
                    </p>
                  )}

                  {/* Bubble */}
                  <div
                    className={`px-3 py-2 text-xs leading-relaxed break-words ${
                      mine
                        ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-violet-500/20"
                        : isDarkMode
                          ? "bg-gray-700 text-gray-100 rounded-2xl rounded-bl-sm"
                          : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                    } ${msg._optimistic ? "opacity-70" : ""}`}
                  >
                    {msg.text}
                  </div>

                  {/* Timestamp */}
                  <p className={`text-[9px] mt-0.5 mx-1 ${textMuted}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    {mine && !msg._optimistic && (
                      <FaCheckDouble className="inline ml-1 text-violet-400" />
                    )}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div className={`p-3 border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"} flex gap-2 flex-shrink-0`}>
          <input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className={`flex-1 ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all`}
            disabled={sending}
          />
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!newMsg.trim() || sending}
            className="p-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl disabled:opacity-40 shadow-md shadow-violet-500/30 transition-all"
          >
            <FaPaperPlane className="text-xs" />
          </motion.button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ROOMS LIST VIEW
  // ═══════════════════════════════════════════════════════
  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${textPrimary}`}>
          {rooms.length} Active Room{rooms.length !== 1 ? "s" : ""}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <FaPlus className="text-[10px]" />
          {showCreate ? "Cancel" : "Create Room"}
        </motion.button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            className={`${cardBg} border rounded-2xl p-3 space-y-2 overflow-hidden`}
          >
            <input
              placeholder="Room name *" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-violet-500/40`}
            />
            <select
              value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className={`w-full ${inputBg} px-3 py-2 rounded-xl text-xs border focus:outline-none`}
            >
              {["General","Mathematics","Programming","Database","Web Dev","AI/ML","Other"].map(s => <option key={s}>{s}</option>)}
            </select>
            <motion.button
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              onClick={handleCreate} disabled={loading || !form.name}
              className="w-full py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Room"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {rooms.length === 0 && (
        <div className={`text-center py-10 ${textMuted} text-xs`}>
          <FaUsers className="mx-auto mb-2 text-2xl opacity-30" />
          <p>No study rooms yet.</p>
          <p className="mt-1 opacity-60">Create one to get started!</p>
        </div>
      )}

      {/* Room cards */}
      {rooms.map(room => {
        const unread = unreadMap[room._id] || 0;
        return (
          <motion.div
            key={room._id}
            initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
            className={`${cardBg} border rounded-2xl p-3 relative transition-all ${unread > 0 ? "ring-2 ring-violet-500/40" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${textPrimary} truncate`}># {room.name}</p>
                  {/* Unread badge */}
                  {unread > 0 && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
                <p className={`text-xs ${textMuted}`}>
                  {room.subject} • {room.members?.length || 0}/{room.maxMembers} members
                </p>
                {/* Last message preview */}
                {room.messages?.length > 0 && (
                  <p className={`text-[10px] ${textMuted} mt-0.5 truncate`}>
                    💬 {room.messages[room.messages.length - 1]?.text?.slice(0, 40)}…
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <motion.button
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => handleJoin(room)}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                    unread > 0
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  }`}
                >
                  <FaSignInAlt className="text-[10px]" />
                  {unread > 0 ? "View" : "Join"}
                </motion.button>
                <motion.button
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => handleDelete(room._id)}
                  className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <FaTrash className="text-[10px]" />
                </motion.button>
              </div>
            </div>

            {/* Online indicator dot */}
            {unread > 0 && (
              <span className="absolute top-3 left-3 w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────
function Leaderboard({ isDarkMode, cardBg, textPrimary, textMuted }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("/api/social/leaderboard");
        setEntries(data.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const medals    = ["🥇", "🥈", "🥉"];
  const rankColor = ["text-yellow-400", "text-gray-300", "text-orange-400"];

  return (
    <div className="space-y-3">
      <div className={`${cardBg} border rounded-2xl p-4`}>
        <div className="flex items-center space-x-2 mb-3">
          <FaTrophy className="text-yellow-400" />
          <h3 className={`font-semibold text-sm ${textPrimary}`}>Weekly Leaderboard</h3>
          <span className={`ml-auto text-xs ${textMuted}`}>Resets every Monday</span>
        </div>

        {loading && <p className={`text-center text-xs ${textMuted} py-4`}>Loading...</p>}

        {!loading && entries.length === 0 && (
          <div className={`text-center py-8 ${textMuted} text-xs`}>
            <FaTrophy className="mx-auto mb-2 text-2xl opacity-30" />
            <p>No entries yet this week.</p>
            <p className="mt-1 opacity-60">Start asking questions to appear here!</p>
          </div>
        )}

        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry._id}
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${
                i === 0 ? "bg-yellow-500/10 border border-yellow-500/30" :
                i === 1 ? "bg-gray-500/10 border border-gray-500/30" :
                i === 2 ? "bg-orange-500/10 border border-orange-500/30" :
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <span className="text-lg w-6 text-center">{medals[i] || `#${i+1}`}</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: entry.avatarColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                {entry.userName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${i < 3 ? rankColor[i] : textPrimary}`}>{entry.userName}</p>
                <p className={`text-[10px] ${textMuted}`}>{entry.totalQuestions} total questions</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${i < 3 ? rankColor[i] : textPrimary}`}>{entry.weeklyQuestions}</p>
                <p className={`text-[10px] ${textMuted}`}>this week</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}