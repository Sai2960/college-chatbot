const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");  // ✅ fixed
const { generateQuiz } = require('../controllers/quizController_fix')


router.post("/generate", protect, generateQuiz);

module.exports = router;