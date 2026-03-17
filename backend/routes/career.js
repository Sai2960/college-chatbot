const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCareerAdvice,
  compareTwoCourses,
  getCodingHelp,
  recommendCourse,
  getStudyRoadmap,
  buildResume,
  interviewPractice,
  jobSuggestions,
  skillGapAnalyzer,
} = require('../controllers/careerController_fix')


// Existing public routes
router.post('/compare',          compareTwoCourses);
router.post('/recommend',        recommendCourse);
router.post('/guidance',         getCareerAdvice);
router.post('/programming-help', getCodingHelp);
router.post('/roadmap',          getStudyRoadmap);

// New protected routes
router.post('/resume',           protect, buildResume);
router.post('/interview',        protect, interviewPractice);
router.post('/jobs',             protect, jobSuggestions);
router.post('/skillgap',         protect, skillGapAnalyzer);

module.exports = router;