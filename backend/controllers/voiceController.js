// voiceController.js - Complete ChatGPT-style voice

const Chat = require('../models/Chat');

exports.handleVoiceChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'No message provided' 
      });
    }

    console.log('🎤 User said:', message);

    // Generate AI response
    let aiResponse = '';
    let source = 'fallback';
    
    try {
      // Try Ollama first (FREE & LOCAL)
      console.log('🔍 Trying Ollama...');
      
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: `You are a helpful college AI assistant. Student asks: "${message}"\n\nProvide a clear, concise spoken response (2-3 sentences):`,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        aiResponse = data.response;
        source = 'ollama';
        console.log('✅ Ollama response:', aiResponse);
      } else {
        throw new Error('Ollama not available');
      }

    } catch (ollamaError) {
      console.log('⚠️ Ollama unavailable, using intelligent fallback');
      aiResponse = getSmartFallbackResponse(message);
      source = 'fallback';
    }

    // Save to chat history
    let chat = null;
    
    if (req.body.chatId) {
      chat = await Chat.findById(req.body.chatId);
      if (chat) {
        chat.messages.push(
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        );
        chat.updatedAt = new Date();
        await chat.save();
      }
    } else if (req.user) {
      // Create new chat
      chat = await Chat.create({
        user: req.user._id,
        title: message.substring(0, 50) + '...',
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        ]
      });
    }

    return res.json({
      success: true,
      data: {
        transcription: message,
        message: aiResponse,
        chat: chat,
        source: source,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Voice chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice message',
      details: error.message
    });
  }
};

function getSmartFallbackResponse(message) {
  const msg = message.toLowerCase();
  
  // Greetings
  if (msg.match(/\b(hello|hi|hey|greetings|good morning|good evening)\b/)) {
    return "Hello! I'm your AI study assistant. How can I help you today?";
  }
  
  // Help requests
  if (msg.match(/\b(help|what can you|capabilities|what do you do)\b/)) {
    return "I can help with programming, databases, web development, exam prep, and more. What subject interests you?";
  }
  
  // Programming
  if (msg.match(/\b(code|coding|programming|program|java|python|javascript|c\+\+|c language)\b/)) {
    return "I'd love to help with programming! What specific concept or problem are you working on? I can explain syntax, debug errors, or teach algorithms.";
  }
  
  // Database
  if (msg.match(/\b(database|sql|mongodb|mysql|dbms|query|table)\b/)) {
    return "I can explain database concepts! Are you learning SQL queries, database design, normalization, or something else?";
  }
  
  // BCA/College
  if (msg.match(/\b(bca|bachelor|syllabus|semester|course|subject)\b/)) {
    if (msg.includes('fees') || msg.includes('cost') || msg.includes('price')) {
      return "BCA fees vary by college, typically ranging from 30,000 to 2 lakh rupees per year in India. Check your specific college for exact fees and scholarships.";
    }
    if (msg.includes('syllabus') || msg.includes('subjects')) {
      return "BCA covers programming in C, Java, Python, database management, web development, data structures, and software engineering. Which semester or topic do you need help with?";
    }
    return "BCA is a great choice! It covers programming, databases, web development, and more. Which aspect would you like to know about?";
  }
  
  // Exams
  if (msg.match(/\b(exam|test|preparation|prepare|study|revision)\b/)) {
    return "Let's prepare for your exam! Which subject do you need help with? I can explain concepts, provide practice questions, and help you revise.";
  }
  
  // Web development
  if (msg.match(/\b(web|website|html|css|react|node|frontend|backend)\b/)) {
    return "Web development is exciting! Are you learning frontend with HTML, CSS, React, or backend with Node.js? What specific topic can I help with?";
  }
  
  // Data structures
  if (msg.match(/\b(data structure|algorithm|array|linked list|stack|queue|tree|graph)\b/)) {
    return "Data structures are fundamental! Which one are you studying? Arrays, linked lists, stacks, queues, trees, or graphs? I can explain with examples.";
  }
  
  // Software Engineering
  if (msg.match(/\b(software|engineering|sdlc|agile|waterfall|testing)\b/)) {
    return "Software engineering principles are important! Are you learning about SDLC, Agile methodology, testing, or project management?";
  }
  
  // Operating Systems
  if (msg.match(/\b(operating system|os|linux|windows|process|thread|memory)\b/)) {
    return "Operating systems concepts! Are you studying processes, threads, memory management, or something else? I can explain clearly.";
  }
  
  // Networking
  if (msg.match(/\b(network|networking|tcp|ip|osi|protocol)\b/)) {
    return "Networking concepts! Are you learning about OSI model, TCP/IP, protocols, or network configuration? What specific topic?";
  }
  
  // Generic fallback
  return `I heard your question about "${message.substring(0, 50)}". I'm here to help with college studies, programming, databases, web development, and exam preparation. Could you tell me more specifically what you need help with?`;
}
