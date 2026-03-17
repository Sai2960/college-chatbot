const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");  // ✅ fixed
const { generateStudyPlan } = require("../controllers/studyController");  // ✅ fixed

router.post("/generate", protect, generateStudyPlan);

module.exports = router;