const Assignment = require("../models/Assignment");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user.id }).sort({
      dueDate: 1,
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

// POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const { title, subject, dueDate, priority, notes } = req.body;
    const assignment = await Assignment.create({
      userId: req.user.id,
      title,
      subject,
      dueDate,
      priority,
      notes,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Failed to create assignment" });
  }
};

// PUT /api/assignments/:id
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!assignment) return res.status(404).json({ message: "Not found" });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Failed to update assignment" });
  }
};

// DELETE /api/assignments/:id
const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete assignment" });
  }
};

// POST /api/assignments/ai-remind  — AI generates a reminder/tip
const aiReminder = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      userId: req.user.id,
      status: { $ne: "completed" },
    }).sort({ dueDate: 1 });

    if (assignments.length === 0) {
      return res.json({ message: "You have no pending assignments! Great job." });
    }

    const list = assignments
      .map(
        (a) =>
          `- ${a.title} (${a.subject}) due ${new Date(a.dueDate).toDateString()}, priority: ${a.priority}`
      )
      .join("\n");

    const prompt = `You are a helpful college assistant. The student has these pending assignments:\n${list}\n\nGive a short motivating reminder and suggest which one to tackle first and why. Keep it under 100 words.`;

    const completion = await groq.chat.completions.create({
model: "model: "llama-3.3-70b-versatile"
",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    res.json({ message: completion.choices[0]?.message?.content });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate reminder" });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  aiReminder,
};