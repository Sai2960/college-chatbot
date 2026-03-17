const Chat = require('../models/Chat');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateGroqResponse, testGroqConnection } = require('./Groqcontroller')
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Provider selection
const AI_PROVIDER = process.env.AI_PROVIDER || 'GROQ'; // 'GROQ' or 'GEMINI'

// Cache the working model globally
let cachedWorkingModel = 'gemini-flash-latest';

/**
 * @desc    Send message and get AI response (Hybrid: GROQ or Gemini)
 * @route   POST /api/chat/message
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    let chat;

    // If chatId exists, find the chat
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat || chat.user.toString() !== userId.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
    } else {
      // Create new chat
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      chat = await Chat.create({
        user: userId,
        title,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message
    });

    let aiResponse;

    // Choose AI provider based on configuration
    if (AI_PROVIDER === 'GROQ') {
      // Use GROQ (Fast, Free, Educational)
      try {
        const conversationHistory = chat.messages.slice(0, -1);
        aiResponse = await generateGroqResponse(message, conversationHistory);
      } catch (error) {
        console.error('GROQ failed, falling back to Gemini:', error);
        // Fallback to Gemini if GROQ fails
        aiResponse = await generateGeminiResponse(message, chat.messages.slice(0, -1));
      }
    } else {
      // Use Gemini
      aiResponse = await generateGeminiResponse(message, chat.messages.slice(0, -1));
    }

    // Add AI response to chat
    chat.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        chat,
        provider: AI_PROVIDER
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    let userMessage = 'Error processing message';
    
    if (error.message.includes('API key')) {
      userMessage = 'Invalid API key';
    } else if (error.message.includes('overloaded') || error.message.includes('503')) {
      userMessage = 'AI is busy, try again';
    } else if (error.message.includes('quota') || error.message.includes('429')) {
      userMessage = 'Rate limit reached, wait a moment';
    } else if (error.message.includes('unavailable')) {
      userMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: userMessage
    });
  }
};

/**
 * Generate response using Gemini (Fallback)
 */
const generateGeminiResponse = async (message, conversationHistory) => {
  // Build prompt with conversation history
  let fullPrompt = '';
  
  if (conversationHistory.length > 0) {
    fullPrompt += 'Previous conversation:\n';
    conversationHistory.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    fullPrompt += '\n';
  }
  
  fullPrompt += `Current question: ${message}`;

  const modelsToTry = [
    cachedWorkingModel,
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-pro-latest',
    'gemini-flash-lite-latest',
  ];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();
      
      if (cachedWorkingModel !== modelName) {
        cachedWorkingModel = modelName;
      }
      
      return response;
    } catch (error) {
      if (modelName === cachedWorkingModel) {
        cachedWorkingModel = null;
      }
      
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        throw new Error('AI service temporarily unavailable');
      }
      continue;
    }
  }
};

/**
 * @desc    Get chat history
 * @route   GET /api/chat/history
 * @access  Private
 */
const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title messages bookmarked createdAt updatedAt');

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history'
    });
  }
};

/**
 * @desc    Get specific chat
 * @route   GET /api/chat/:id
 * @access  Private
 */
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat || chat.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat'
    });
  }
};

/**
 * @desc    Delete chat
 * @route   DELETE /api/chat/:id
 * @access  Private
 */
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat || chat.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    await chat.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting chat'
    });
  }
};

/**
 * @desc    Toggle bookmark
 * @route   PUT /api/chat/:id/bookmark
 * @access  Private
 */
const toggleBookmark = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat || chat.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    chat.bookmarked = !chat.bookmarked;
    await chat.save();

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling bookmark'
    });
  }
};

/**
 * @desc    Test AI providers (Gemini + GROQ)
 * @route   GET /api/chat/test-ai
 * @access  Public
 */
const testAI = async (req, res) => {
  try {
    const results = {
      gemini: null,
      groq: null
    };

    // Test GROQ
    try {
      const groqTest = await testGroqConnection();
      results.groq = groqTest;
    } catch (error) {
      results.groq = { success: false, error: error.message };
    }

    // Test Gemini
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
      const result = await model.generateContent("Say 'Gemini working!'");
      results.gemini = {
        success: true,
        message: result.response.text(),
        model: 'gemini-flash-latest'
      };
    } catch (error) {
      results.gemini = { success: false, error: error.message };
    }

    res.json({
      success: true,
      currentProvider: AI_PROVIDER,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Legacy test endpoint
 */
const testGemini = async (req, res) => {
  return testAI(req, res);
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChat,
  deleteChat,
  toggleBookmark,
  testGemini,
  testAI
};
