const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");  // ✅ fixed
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  aiReminder,
} = require('../controllers/assignmentController_fix')


router.get("/", protect, getAssignments);
router.post("/", protect, createAssignment);
router.put("/:id", protect, updateAssignment);
router.delete("/:id", protect, deleteAssignment);
router.post("/ai-remind", protect, aiReminder);

module.exports = router;