const Groq = require('groq-sdk');

// Initialize GROQ with API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Best model for educational content
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Fast + Accurate

/**
 * Enhanced system prompt for educational chatbot
 */
const EDUCATIONAL_SYSTEM_PROMPT = `You are an expert educational AI assistant specializing in:
- Career guidance for MCA, B.Tech, M.Tech, BSc IT, MSc IT students
- Course recommendations and comparisons
- Programming help (Java, Python, C++, JavaScript, etc.)
- Database concepts and SQL
- Web development (HTML, CSS, React, Node.js)
- Data structures and algorithms
- Interview preparation
- Study tips and exam strategies
- Project ideas and guidance

Guidelines:
1. Give detailed, accurate, and professional responses
2. Use simple language for complex topics
3. Provide examples when explaining concepts
4. Suggest practical resources and learning paths
5. Be encouraging and supportive
6. For career advice, consider Indian education system and job market
7. Always verify programming code syntax
8. Break down complex problems into steps

Be concise but comprehensive. Focus on helping students succeed.`;

/**
 * Generate AI response using GROQ
 */
const generateGroqResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Build messages array with system prompt
    const messages = [
      {
        role: 'system',
        content: EDUCATIONAL_SYSTEM_PROMPT
      }
    ];

    // Add conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Call GROQ API
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: messages,
      temperature: 0.7, // Balanced creativity
      max_tokens: 2048, // Detailed responses
      top_p: 0.9,
      stream: false
    });

    return completion.choices[0]?.message?.content || 'No response generated';

  } catch (error) {
    console.error('GROQ API Error:', error);
    
    // Handle specific errors
    if (error.message?.includes('API key')) {
      throw new Error('Invalid GROQ API key');
    } else if (error.message?.includes('rate limit')) {
      throw new Error('Rate limit reached. Please wait a moment.');
    } else if (error.message?.includes('model')) {
      throw new Error('Model unavailable. Please try again.');
    } else {
      throw new Error('AI service temporarily unavailable');
    }
  }
};

/**
 * Career-specific guidance
 */
const getCareerGuidance = async (course, query) => {
  const careerPrompt = `As a career counselor for ${course} students, provide detailed guidance on: ${query}

Consider:
- Current job market trends in India
- Required skills and certifications
- Salary expectations and growth
- Top companies hiring
- Interview preparation tips
- Further education options

Give practical, actionable advice.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: EDUCATIONAL_SYSTEM_PROMPT },
        { role: 'user', content: careerPrompt }
      ],
      temperature: 0.6,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    throw new Error('Career guidance service error');
  }
};

/**
 * Course comparison
 */
const compareCourses = async (course1, course2) => {
  const comparisonPrompt = `Compare ${course1} vs ${course2} in detail:

1. Curriculum and subjects
2. Career opportunities
3. Salary potential
4. Difficulty level
5. Job market demand
6. Best for which type of students
7. Further study options
8. Industry preferences

Provide a comprehensive comparison table and recommendation.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: EDUCATIONAL_SYSTEM_PROMPT },
        { role: 'user', content: comparisonPrompt }
      ],
      temperature: 0.5,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    throw new Error('Course comparison service error');
  }
};

/**
 * Programming help
 */
const getProgrammingHelp = async (language, problem) => {
  const codingPrompt = `Help with ${language} programming:

Problem: ${problem}

Provide:
1. Clear explanation of the concept
2. Step-by-step solution approach
3. Working code example with comments
4. Common mistakes to avoid
5. Best practices
6. Additional resources

Format code properly with syntax highlighting indicators.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: EDUCATIONAL_SYSTEM_PROMPT },
        { role: 'user', content: codingPrompt }
      ],
      temperature: 0.3, // More deterministic for code
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    throw new Error('Programming help service error');
  }
};

/**
 * Test GROQ connection
 */
const testGroqConnection = async () => {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'user', content: 'Say "Hello! GROQ is working perfectly!"' }
      ],
      temperature: 0.5,
      max_tokens: 50
    });

    return {
      success: true,
      message: completion.choices[0]?.message?.content,
      model: GROQ_MODEL
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateGroqResponse,
  getCareerGuidance,
  compareCourses,
  getProgrammingHelp,
  testGroqConnection,
  GROQ_MODEL
};