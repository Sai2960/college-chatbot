const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");  // ✅ back to normal import
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const syllabusStore = {};

const uploadSyllabus = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfBuffer = fs.readFileSync(req.file.path);
    const parsed = await pdfParse(pdfBuffer);
    const text = parsed.text;

    if (!text || text.trim().length === 0) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Could not extract text. Make sure it's not a scanned image." });
    }

    const userId = req.user?._id || req.user?.id || "guest";
    syllabusStore[userId] = text;

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.status(200).json({
      message: "Syllabus uploaded successfully",
      preview: text.substring(0, 300) + "...",
      totalChars: text.length,
    });
  } catch (err) {
    console.error("Syllabus upload error:", err);
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({
      message: "Failed to process syllabus",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const askSyllabus = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: "Question is required" });

    const userId = req.user?._id || req.user?.id || "guest";
    const syllabusText = syllabusStore[userId];

    if (!syllabusText) return res.status(400).json({ message: "Please upload a syllabus first" });

    const prompt = `You are a helpful college assistant. Based on the following syllabus content, answer the student's question clearly and concisely.

SYLLABUS CONTENT:
${syllabusText.substring(0, 6000)}

STUDENT QUESTION: ${question}

Answer:`;

    const completion = await groq.chat.completions.create({
model: "llama3-70b-8192",

messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    });

    const answer = completion.choices[0]?.message?.content || "No answer found.";
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Syllabus Q&A error:", err);
    return res.status(500).json({ message: "Failed to answer question" });
  }
};

const syllabusStatus = (req, res) => {
  const userId = req.user?._id || req.user?.id || "guest";
  return res.json({ uploaded: !!syllabusStore[userId] });
};

console.log("✅ syllabusController loaded:", { uploadSyllabus, askSyllabus, syllabusStatus });
module.exports = { uploadSyllabus, askSyllabus, syllabusStatus };