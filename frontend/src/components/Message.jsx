/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaRobot, FaCopy, FaCheck } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./Message.css";

function Message({ message, user, isBot }) {
  const [copied, setCopied] = useState(false);

  // Determine if message is from user or bot
  const isUser = message.role === "user" || !isBot;
  const isBotMessage =
    message.role === "assistant" || message.role === "bot" || isBot;

  // Get user initials for avatar
  const getInitials = () => {
    if (isBotMessage) return "AI";
    const name = user?.displayName || user?.name || user?.username || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format timestamp - FIXED TO 12-HOUR FORMAT WITH AM/PM
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get message content (support both 'content' and 'text' properties)
  const messageContent = message.content || message.text || "";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-3 mb-4 message-enter ${
        isBotMessage ? "" : "flex-row-reverse space-x-reverse"
      } ${isBotMessage ? "bot-message" : "user-message"}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 message-avatar">
        {isBotMessage ? (
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg bot-avatar`}
          >
            <FaRobot size={16} className="sm:text-lg" />
          </div>
        ) : (
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName || user.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
              />
            ) : (
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg user-avatar-placeholder"
                style={{
                  background:
                    user?.avatarColor ||
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <span className="text-xs sm:text-sm">{getInitials()}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Message Content */}
      <div
        className={`flex-1 message-content ${isBotMessage ? "" : "flex justify-end"}`}
      >
        <div
          className={`max-w-3xl rounded-2xl px-4 py-3 shadow-md relative group transition-all ${
            isBotMessage
              ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700"
              : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          }`}
        >
          {/* Message Header */}
          <div className="message-header flex items-center justify-between mb-2">
            <span
              className={`text-xs font-semibold message-sender ${
                isBotMessage
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-blue-100"
              }`}
            >
              {isBotMessage
                ? "College AI"
                : user?.displayName || user?.name || user?.username || "You"}
            </span>

            {/* Timestamp */}
            {(message.timestamp || message.createdAt) && (
              <span
                className={`text-xs message-time ${
                  isBotMessage
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-blue-100"
                }`}
              >
                {formatTime(message.timestamp || message.createdAt)}
              </span>
            )}
          </div>
          {/* Copy Button (for AI/Bot messages only) */}
          {isBotMessage && (
            <button
              onClick={() => copyToClipboard(messageContent)}
              className="absolute top-2 right-2 p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
              title="Copy message"
            >
              {copied ? (
                <FaCheck className="text-green-500 text-xs" />
              ) : (
                <FaCopy className="text-gray-600 dark:text-gray-400 text-xs" />
              )}
            </button>
          )}
          {/* Message Text */}
          <div className="message-text">
            {!isBotMessage ? (
              // User messages - simple text with line breaks
              <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {messageContent}
              </p>
            ) : (
              // Bot messages - with Markdown support
              <div className="markdown-content prose dark:prose-invert max-w-none prose-sm sm:prose-base">
                <ReactMarkdown
                  components={{
                    // Code blocks with syntax highlighting
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <div className="relative group/code">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg my-2 text-sm"
                            showLineNumbers={true}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                          {/* Copy button for code blocks */}
                          <button
                            onClick={() => copyToClipboard(String(children))}
                            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover/code:opacity-100 transition-opacity"
                            title="Copy code"
                          >
                            {copied ? (
                              <FaCheck className="text-green-400 text-xs" />
                            ) : (
                              <FaCopy className="text-gray-300 text-xs" />
                            )}
                          </button>
                        </div>
                      ) : (
                        // Inline code
                        <code
                          className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    // Links
                    a({ node, children, ...props }) {
                      return (
                        <a
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    // Paragraphs
                    p({ node, children, ...props }) {
                      return (
                        <p
                          className="mb-2 last:mb-0 leading-relaxed"
                          {...props}
                        >
                          {children}
                        </p>
                      );
                    },
                    // Lists
                    ul({ node, children, ...props }) {
                      return (
                        <ul
                          className="list-disc list-inside mb-2 space-y-1"
                          {...props}
                        >
                          {children}
                        </ul>
                      );
                    },
                    ol({ node, children, ...props }) {
                      return (
                        <ol
                          className="list-decimal list-inside mb-2 space-y-1"
                          {...props}
                        >
                          {children}
                        </ol>
                      );
                    },
                    // Headings
                    h1({ node, children, ...props }) {
                      return (
                        <h1 className="text-2xl font-bold mb-2 mt-4" {...props}>
                          {children}
                        </h1>
                      );
                    },
                    h2({ node, children, ...props }) {
                      return (
                        <h2 className="text-xl font-bold mb-2 mt-3" {...props}>
                          {children}
                        </h2>
                      );
                    },
                    h3({ node, children, ...props }) {
                      return (
                        <h3 className="text-lg font-bold mb-2 mt-2" {...props}>
                          {children}
                        </h3>
                      );
                    },
                    // Blockquotes
                    blockquote({ node, children, ...props }) {
                      return (
                        <blockquote
                          className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2"
                          {...props}
                        >
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {messageContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Message;