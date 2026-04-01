const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");  // ✅ fixed
const { generateQuiz } = require("../controllers/quizController");  // ✅ fixed

router.post("/generate", protect, generateQuiz);

module.exports = router;