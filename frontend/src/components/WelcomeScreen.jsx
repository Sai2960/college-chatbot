/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import {
  FaRobot,
  FaLightbulb,
  FaBook,
  FaCode,
  FaGraduationCap,
} from "react-icons/fa";

function WelcomeScreen({ userName, quickReplies, onQuickReply }) {
  const features = [
    {
      icon: <FaBook />,
      title: "Study Help",
      description: "Get help with BCA subjects and syllabus",
    },
    {
      icon: <FaCode />,
      title: "Coding Assistance",
      description: "Debug code and learn programming concepts",
    },
    {
      icon: <FaGraduationCap />,
      title: "Exam Prep",
      description: "Prepare for exams with AI-powered guidance",
    },
    {
      icon: <FaLightbulb />,
      title: "Career Advice",
      description: "Get insights about career paths and opportunities",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Animated Robot Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
        transition={{
          scale: { duration: 0.5 },
          rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-2xl">
          <FaRobot size={48} />
        </div>
      </motion.div>

      {/* Welcome Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-3">
          Hello, {userName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-2xl">
          I'm your AI-powered college assistant. Ask me anything about your
          studies, programming, exams, or career guidance!
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full max-w-4xl"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl mb-3 text-blue-500">{feature.icon}</div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Reply Suggestions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-3xl"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          💡 Try asking:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickReplies.map((reply, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onQuickReply(reply)}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl text-left transition-all shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600"
            >
              <span className="text-sm font-medium">{reply}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-gray-400 dark:text-gray-500 text-xs mt-8"
      >
        Type your question below or click on a suggestion to get started ✨
      </motion.p>
    </div>
  );
}

export default WelcomeScreen;
