const Chat = require('../models/Chat');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { 
  getCareerGuidance, 
  compareCourses, 
  getProgrammingHelp 
} = require('./groqController');

// ─── EXISTING FUNCTIONS (unchanged) ──────────────────────────

const getCareerAdvice = async (req, res) => {
  try {
    const { course, query } = req.body;
    if (!course || !query) return res.status(400).json({ success: false, message: 'Please provide course and query' });
    const validCourses = ['MCA', 'B.Tech', 'M.Tech', 'BSc IT', 'MSc IT', 'BCA', 'B.Sc CS'];
    if (!validCourses.some(c => course.toUpperCase().includes(c.toUpperCase()))) {
      return res.status(400).json({ success: false, message: 'Invalid course.' });
    }
    const response = await getCareerGuidance(course, query);
    res.status(200).json({ success: true, data: { course, query, guidance: response } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const compareTwoCourses = async (req, res) => {
  try {
    const { course1, course2 } = req.body;
    if (!course1 || !course2) return res.status(400).json({ success: false, message: 'Please provide both courses' });
    const comparison = await compareCourses(course1, course2);
    res.status(200).json({ success: true, data: { course1, course2, comparison } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCodingHelp = async (req, res) => {
  try {
    const { language, problem } = req.body;
    if (!language || !problem) return res.status(400).json({ success: false, message: 'Please provide language and problem' });
    const help = await getProgrammingHelp(language, problem);
    res.status(200).json({ success: true, data: { language, problem, solution: help } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const recommendCourse = async (req, res) => {
  try {
    const { interests, currentEducation, goals } = req.body;
    if (!interests) return res.status(400).json({ success: false, message: 'Please provide your interests' });
    const prompt = `Student Profile:\n- Interests: ${interests}\n- Current Education: ${currentEducation || 'Not specified'}\n- Career Goals: ${goals || 'Not specified'}\n\nRecommend the best courses with reasons, specializations, skills, career paths, and timeline.`;
    const recommendation = await getCareerGuidance('General', prompt);
    res.status(200).json({ success: true, data: { recommendation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudyRoadmap = async (req, res) => {
  try {
    const { course, currentSemester, targetGoal } = req.body;
    if (!course) return res.status(400).json({ success: false, message: 'Please provide course name' });
    const prompt = `Create a detailed study roadmap for ${course} student. Current: ${currentSemester ? `Semester ${currentSemester}` : 'Starting'}. Goal: ${targetGoal || 'Complete course and get good placement'}. Include semester breakdown, key subjects, tools, projects, certifications, and weekly schedule.`;
    const roadmap = await getCareerGuidance(course, prompt);
    res.status(200).json({ success: true, data: { course, roadmap } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── NEW FUNCTIONS ────────────────────────────────────────────

const buildResume = async (req, res) => {
  try {
    const { name, course, semester, skills, projects, experience, targetRole } = req.body;
    if (!name || !course) return res.status(400).json({ success: false, message: 'Name and course are required' });

    const prompt = `You are a professional resume writer. Create a complete, ATS-friendly resume for a college student.

Student Details:
- Name: ${name}
- Course: ${course}
- Semester: ${semester || 'Final Year'}
- Skills: ${skills || 'Not specified'}
- Projects: ${projects || 'Not specified'}
- Experience/Internships: ${experience || 'None'}
- Target Role: ${targetRole || 'Software Developer'}

Generate a complete resume with these sections:
1. Professional Summary (3-4 lines)
2. Technical Skills (categorized)
3. Education
4. Projects (with tech stack and impact)
5. Experience (if any)
6. Certifications & Achievements
7. Extra-Curricular Activities

Make it professional, concise, and tailored for the target role.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    });

    const resume = completion.choices[0]?.message?.content || "Could not generate resume.";
    res.status(200).json({ success: true, data: { resume } });
  } catch (error) {
    console.error('Resume builder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const interviewPractice = async (req, res) => {
  try {
    const { role, course, difficulty, type } = req.body;
    if (!role) return res.status(400).json({ success: false, message: 'Target role is required' });

    const prompt = `You are a technical interviewer. Generate 10 ${type || 'mixed'} interview questions for a ${course || 'BCA'} student applying for ${role} role.

Difficulty: ${difficulty || 'medium'}
Type: ${type || 'mixed (technical + HR + situational)'}

For each question provide:
1. The question
2. What the interviewer is looking for
3. A model answer (2-3 sentences)
4. Tips to answer well

Format as JSON array:
[
  {
    "id": 1,
    "question": "...",
    "category": "technical/hr/situational",
    "lookingFor": "...",
    "modelAnswer": "...",
    "tip": "..."
  }
]

Return ONLY valid JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
    });

    let raw = completion.choices[0]?.message?.content || "[]";
    raw = raw.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(raw);
    res.status(200).json({ success: true, data: { role, questions } });
  } catch (error) {
    console.error('Interview practice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const jobSuggestions = async (req, res) => {
  try {
    const { course, skills, semester, interests } = req.body;

    const prompt = `You are a career counselor. Suggest job and internship opportunities for a ${course || 'BCA'} student.

Student Profile:
- Course: ${course || 'BCA'}
- Semester: ${semester || 'Final Year'}
- Skills: ${skills || 'Basic programming'}
- Interests: ${interests || 'Software development'}

Provide suggestions as JSON:
{
  "internships": [
    {
      "role": "...",
      "companies": ["company1", "company2"],
      "skills_needed": ["skill1", "skill2"],
      "duration": "...",
      "stipend": "...",
      "where_to_apply": ["LinkedIn", "Internshala"]
    }
  ],
  "fulltime_jobs": [
    {
      "role": "...",
      "companies": ["company1", "company2"],
      "skills_needed": ["skill1", "skill2"],
      "salary_range": "...",
      "where_to_apply": ["LinkedIn", "Naukri"]
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}

Return ONLY valid JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    });

    let raw = completion.choices[0]?.message?.content || "{}";
    raw = raw.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(raw);
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Job suggestions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const skillGapAnalyzer = async (req, res) => {
  try {
    const { currentSkills, targetRole, course } = req.body;
    if (!targetRole) return res.status(400).json({ success: false, message: 'Target role is required' });

    const prompt = `You are a career advisor. Analyze the skill gap for a ${course || 'BCA'} student who wants to become a ${targetRole}.

Current Skills: ${currentSkills || 'Basic programming knowledge'}
Target Role: ${targetRole}

Provide analysis as JSON:
{
  "currentLevel": "beginner/intermediate/advanced",
  "targetRole": "${targetRole}",
  "missingSkills": [
    {
      "skill": "...",
      "priority": "high/medium/low",
      "timeToLearn": "...",
      "resources": ["resource1", "resource2"]
    }
  ],
  "existingStrengths": ["strength1", "strength2"],
  "learningPath": [
    {
      "month": 1,
      "focus": "...",
      "skills": ["skill1", "skill2"],
      "projects": ["project1"]
    }
  ],
  "estimatedTimeToReady": "...",
  "readinessScore": 0-100
}

Return ONLY valid JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    });

    let raw = completion.choices[0]?.message?.content || "{}";
    raw = raw.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(raw);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Skill gap error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCareerAdvice,
  compareTwoCourses,
  getCodingHelp,
  recommendCourse,
  getStudyRoadmap,
  buildResume,
  interviewPractice,
  jobSuggestions,
  skillGapAnalyzer,
};