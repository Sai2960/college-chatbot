const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/study/generate
const generateStudyPlan = async (req, res) => {
  try {
    const { subjects, examDate, hoursPerDay, currentDate } = req.body;

    if (!subjects || !examDate || !hoursPerDay) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const today = currentDate || new Date().toDateString();

    const prompt = `You are an expert academic planner. Create a detailed day-by-day study plan for a college student.

Details:
- Subjects to study: ${subjects}
- Exam date: ${examDate}
- Available study hours per day: ${hoursPerDay}
- Today's date: ${today}

Generate a structured study schedule in this exact JSON format (return ONLY valid JSON, no explanation, no markdown):
{
  "totalDays": 7,
  "hoursPerDay": ${hoursPerDay},
  "plan": [
    {
      "day": 1,
      "date": "Day label",
      "tasks": [
        { "subject": "Subject Name", "topic": "Topic to cover", "duration": "X hours" }
      ],
      "tip": "A short motivational tip for the day"
    }
  ],
  "generalTips": ["tip1", "tip2", "tip3"]
}

Keep the plan to a maximum of 7 days. Return ONLY valid compact JSON.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    });

    let raw = completion.choices[0]?.message?.content || "{}";

    // Strip markdown code fences if present
    raw = raw.replace(/```json|```/g, "").trim();

    // Extract JSON object if there's extra text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: "AI returned invalid response. Please try again." });
    }

    const plan = JSON.parse(jsonMatch[0]);
    res.json(plan);
  } catch (err) {
    console.error("Study plan error:", err);
    res.status(500).json({ message: "Failed to generate study plan" });
  }
};

module.exports = { generateStudyPlan };