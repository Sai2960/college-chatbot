const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/quiz/generate
const generateQuiz = async (req, res) => {
  try {
    const { topic, numQuestions = 5, difficulty = "medium" } = req.body;

    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const prompt = `You are a college professor. Generate ${numQuestions} multiple choice questions on the topic: "${topic}".
Difficulty: ${difficulty}

Return ONLY valid JSON in this exact format (no explanation, no markdown):
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
model: "llama3-70b-8192",

messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    });

    let raw = completion.choices[0]?.message?.content || "{}";
    raw = raw.replace(/```json|```/g, "").trim();

    const quiz = JSON.parse(raw);
    res.json(quiz);
  } catch (err) {
    console.error("Quiz error:", err);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
};

module.exports = { generateQuiz };