/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaperPlane,
  FaPlus,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaTrash,
  FaBookmark,
  FaRegBookmark,
  FaRobot,
  FaTools,
  FaFilePdf,
  FaBell,
} from "react-icons/fa";
import Sidebar, { FeaturePanel } from "../components/Sidebar";
import Message from "../components/Message";
import jsPDF from "jspdf";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Chat() {
  const { user, logout, setUser } = useAuth();

  const [chats, setChats]                   = useState([]);
  const [currentChat, setCurrentChat]       = useState(null);
  const [messages, setMessages]             = useState([]);
  const [inputMessage, setInputMessage]     = useState("");
  const [loading, setLoading]               = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(window.innerWidth >= 768);
  const [featurePanelOpen, setFeaturePanelOpen] = useState(false);
  const [darkMode, setDarkMode]             = useState(false);
  const [typingMessage, setTypingMessage]   = useState("");
  const [isTyping, setIsTyping]             = useState(false);

  // ── Social unread badge ──
  const [socialUnread, setSocialUnread]     = useState(0);

  const messagesEndRef    = useRef(null);
  const typingIntervalRef = useRef(null);

  // Clear unread when feature panel is opened
  const handleFeaturePanelToggle = useCallback((open) => {
    setFeaturePanelOpen(open);
    if (open) setSocialUnread(0);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  useEffect(() => { loadChatHistory(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMessage]);

  useEffect(() => {
    return () => { if (typingIntervalRef.current) clearInterval(typingIntervalRef.current); };
  }, []);

  const loadChatHistory = async () => {
    try {
      const { data } = await axios.get("/api/chat/history");
      setChats(data.data);
    } catch (error) { console.error("Error loading chats:", error); }
  };

  const loadChat = async (chatId) => {
    try {
      const { data } = await axios.get(`/api/chat/${chatId}`);
      setCurrentChat(data.data);
      setMessages(data.data.messages);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (error) { console.error("Error loading chat:", error); }
  };

  const createNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setInputMessage("");
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteChat = async (chatId) => {
    try {
      await axios.delete(`/api/chat/${chatId}`);
      if (currentChat?._id === chatId) createNewChat();
      loadChatHistory();
    } catch (error) { console.error("Error deleting chat:", error); }
  };

  const toggleBookmark = async (chatId) => {
    try {
      await axios.put(`/api/chat/${chatId}/bookmark`);
      loadChatHistory();
      if (currentChat?._id === chatId)
        setCurrentChat(prev => ({ ...prev, bookmarked: !prev.bookmarked }));
    } catch (error) { console.error("Error toggling bookmark:", error); }
  };

  const handleUpdateUser = (updatedUserData) => { setUser(updatedUserData); };

  const typeMessage = (fullText, callback) => {
    if (!fullText || fullText.length === 0) { if (callback) callback(); return; }
    let index = 0;
    setIsTyping(true);
    setTypingMessage(fullText[0]);
    index = 1;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = setInterval(() => {
      if (index < fullText.length) {
        setTypingMessage(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
        setTypingMessage("");
        if (callback) callback();
      }
    }, 20);
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || loading) return;
    const userMessage = { role: "user", content: messageText, timestamp: new Date(), type: "user", text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/chat/message", { message: messageText, chatId: currentChat?._id });
      setLoading(false);
      const aiResponseText = data.data.message;
      typeMessage(aiResponseText, () => {
        const aiMessage = { role: "assistant", content: aiResponseText, timestamp: new Date(), type: "ai", text: aiResponseText };
        setMessages(prev => [...prev, aiMessage]);
      });
      setCurrentChat(data.data.chat);
      loadChatHistory();
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
      setMessages(prev => [...prev, {
        role: "assistant", content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(), type: "ai", text: "Sorry, I encountered an error. Please try again.",
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const exportChatPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("College AI - Chat Export", margin, y); y += 7;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(150);
    doc.text(`Exported: ${new Date().toLocaleString()}  |  Chat: ${currentChat?.title || "New Chat"}`, margin, y); y += 8;
    doc.setDrawColor(180); doc.line(margin, y, pageWidth - margin, y); y += 8;

    messages.forEach(msg => {
      if (y > 270) { doc.addPage(); y = 20; }
      const isUser = msg.role === "user";
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.setTextColor(isUser ? 37 : 22, isUser ? 99 : 163, isUser ? 235 : 74);
      doc.text(isUser ? "You:" : "AI Assistant:", margin, y); y += 5;
      doc.setFont("helvetica", "normal"); doc.setTextColor(40); doc.setFontSize(10);
      const lines = doc.splitTextToSize(msg.content || msg.text || "", maxWidth);
      lines.forEach(line => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, margin, y); y += 5;
      });
      y += 4;
    });
    doc.save(`chat-${currentChat?.title || "export"}-${Date.now()}.pdf`);
  };

  const quickReplies = [
    "Explain BCA syllabus",
    "Help with Java programming",
    "Database concepts",
    "Web development guide",
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden">
      {sidebarOpen && window.innerWidth < 768 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {featurePanelOpen && window.innerWidth < 768 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => handleFeaturePanelToggle(false)} />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        currentChat={currentChat}
        onChatSelect={loadChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onToggleBookmark={toggleBookmark}
        onUpdateUser={handleUpdateUser}
        user={user}
        onLogout={logout}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Feature Panel fullscreen modal */}
      <AnimatePresence>
        {featurePanelOpen && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => handleFeaturePanelToggle(false)}
          >
            <motion.div
              initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl ${
                darkMode ? "bg-gray-900" : "bg-white"
              }`}
            >
              <FeaturePanel
                isDarkMode={darkMode}
                onClose={() => handleFeaturePanelToggle(false)}
                onSocialUnreadChange={setSocialUnread}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <h1 className="text-base md:text-xl font-bold text-gray-800 dark:text-white truncate">
              {currentChat?.title || "New Chat"}
            </h1>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">

            {/* ── Tools Button with unread badge ── */}
            <motion.button
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => handleFeaturePanelToggle(!featurePanelOpen)}
              title="Study Tools"
              className={`relative flex items-center space-x-1.5 px-2.5 py-2 rounded-lg transition-colors text-sm font-medium ${
                featurePanelOpen
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <FaTools size={15} />
              <span className="hidden sm:inline text-xs">Tools</span>

              {/* Notification badge */}
              {socialUnread > 0 && !featurePanelOpen && (
                <motion.span
                  initial={{ scale:0 }} animate={{ scale:1 }}
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg"
                >
                  {socialUnread > 99 ? "99+" : socialUnread}
                </motion.span>
              )}
            </motion.button>

            {/* Export PDF */}
            {messages.length > 0 && (
              <motion.button
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                onClick={exportChatPDF}
                title="Export chat as PDF"
                className="flex items-center space-x-1.5 px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
              >
                <FaFilePdf size={15} className="text-red-400" />
                <span className="hidden sm:inline text-xs font-medium">PDF</span>
              </motion.button>
            )}

            {currentChat && (
              <button
                onClick={() => toggleBookmark(currentChat._id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {currentChat.bookmarked
                  ? <FaBookmark className="text-yellow-500" size={18} />
                  : <FaRegBookmark className="text-gray-600 dark:text-gray-400" size={18} />
                }
              </button>
            )}

            <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {darkMode ? <FaSun className="text-yellow-500" size={18} /> : <FaMoon className="text-gray-600" size={18} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          {messages.length === 0 && !isTyping ? (
            <div className="flex-1 flex items-center justify-center min-h-full">
              <div className="text-center max-w-4xl px-4 w-full">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-transform duration-300">
                  <FaRobot className="text-white text-3xl md:text-5xl" />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                  Hello, {user?.displayName || user?.name || "Student"}! 👋
                </h1>
                <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 mb-6 md:mb-8 px-2">
                  I'm your AI-powered college assistant. Ask me anything about your studies, programming, exams, or career guidance!
                </p>

                <div className="mb-5 inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2 text-purple-400 text-sm">
                  <FaTools className="text-xs" />
                  <span>
                    Try the{" "}
                    <button onClick={() => handleFeaturePanelToggle(true)} className="font-bold underline underline-offset-2 hover:text-purple-300">
                      Study Tools
                    </button>{" "}
                    — Syllabus Q&A, Quiz, Planner &amp; more!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6 max-w-2xl mx-auto">
                  {quickReplies.map((reply, index) => (
                    <motion.button key={index} whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }}
                      onClick={() => sendMessage(reply)}
                      className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-gray-700 dark:text-gray-300 rounded-lg md:rounded-xl text-xs md:text-sm font-medium hover:from-blue-500/20 hover:to-purple-500/20 transition-all shadow-sm hover:shadow-md text-left"
                    >
                      {reply}
                    </motion.button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
                  {[
                    { icon:"📚", title:"Study Help",      desc:"Get explanations on any topic" },
                    { icon:"💻", title:"Code Assistance", desc:"Debug and learn programming"   },
                    { icon:"🎯", title:"Career Guidance", desc:"Plan your future path"          },
                  ].map(card => (
                    <motion.div key={card.title} whileHover={{ y:-5 }}
                      className="p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="text-2xl md:text-3xl mb-1 md:mb-2">{card.icon}</div>
                      <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white mb-1">{card.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <Message key={index} message={msg} user={user} />
              ))}
            </AnimatePresence>
          )}

          {isTyping && typingMessage && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="flex items-start space-x-2 md:space-x-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                <span className="text-xs md:text-sm">AI</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-3 md:px-4 py-2 md:py-3 max-w-3xl shadow-md">
                <div className="text-sm md:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {typingMessage}
                  <span className="inline-block w-0.5 h-3 md:h-4 bg-blue-500 ml-1 animate-pulse align-middle"></span>
                </div>
              </div>
            </motion.div>
          )}

          {loading && !isTyping && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="flex items-start space-x-2 md:space-x-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                <span className="text-xs md:text-sm">AI</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-3 md:px-4 py-2 md:py-3 max-w-3xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay:"0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay:"0.4s" }}></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 md:p-4">
          <div className="flex items-end space-x-2 max-w-4xl mx-auto">
            <textarea
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl md:rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              rows="1"
              style={{ minHeight:"44px", maxHeight:"150px" }}
              disabled={loading || isTyping}
            />
            <motion.button
              whileHover={{ scale: loading || !inputMessage.trim() || isTyping ? 1 : 1.05 }}
              whileTap={{ scale: loading || !inputMessage.trim() || isTyping ? 1 : 0.95 }}
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || loading || isTyping}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl md:rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex-shrink-0"
            >
              <FaPaperPlane size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;