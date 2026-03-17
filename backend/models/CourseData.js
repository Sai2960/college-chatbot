const mongoose = require('mongoose');

const courseDataSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    enum: ['MCA', 'B.Tech', 'M.Tech', 'BSc IT', 'MSc IT', 'BCA', 'B.Sc CS'],
    index: true
  },
  
  // College-specific data
  collegeName: {
    type: String,
    default: 'Generic'
  },
  
  // Syllabus information
  syllabus: {
    semesters: [{
      semesterNumber: Number,
      subjects: [{
        name: String,
        code: String,
        credits: Number,
        description: String
      }]
    }]
  },
  
  // Career paths
  careerPaths: [{
    role: String,
    description: String,
    averageSalary: String,
    skills: [String],
    companies: [String]
  }],
  
  // Important dates (college-specific)
  importantDates: [{
    event: String,
    date: Date,
    description: String
  }],
  
  // Exam patterns
  examPatterns: [{
    examType: String,
    totalMarks: Number,
    duration: String,
    pattern: String
  }],
  
  // Recommended certifications
  certifications: [{
    name: String,
    provider: String,
    difficulty: String,
    cost: String,
    link: String
  }],
  
  // Project ideas
  projects: [{
    title: String,
    difficulty: String,
    technologies: [String],
    description: String,
    semester: Number
  }],
  
  // Study resources
  resources: [{
    type: String, // 'Book', 'Video', 'Website', 'Course'
    title: String,
    author: String,
    link: String,
    isPaid: Boolean,
    rating: Number
  }],
  
  // Admission criteria
  admissionCriteria: {
    minimumPercentage: Number,
    entranceExams: [String],
    eligibility: String,
    fees: String
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true
});

// Indexes for faster queries
courseDataSchema.index({ courseName: 1, collegeName: 1 });
courseDataSchema.index({ isActive: 1 });

// Methods
courseDataSchema.methods.updateLastUpdated = function() {
  this.lastUpdated = Date.now();
  return this.save();
};

// Static method to get course info
courseDataSchema.statics.getCourseInfo = async function(courseName, collegeName = 'Generic') {
  return this.findOne({ courseName, collegeName, isActive: true });
};

// Static method to get all active courses
courseDataSchema.statics.getAllActiveCourses = async function() {
  return this.find({ isActive: true }).select('courseName collegeName careerPaths');
};

const CourseData = mongoose.model('CourseData', courseDataSchema);

module.exports = CourseData;