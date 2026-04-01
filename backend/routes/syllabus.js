const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/auth");  // ✅ destructure protect
const {
  uploadSyllabus,
  askSyllabus,
  syllabusStatus,
} = require("../controllers/syllabusController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/status", protect, syllabusStatus);        // ✅ protect not auth
router.post("/upload", protect, upload.single("syllabus"), uploadSyllabus);
router.post("/ask", protect, askSyllabus);

module.exports = router;