const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic Authentication Fields (from both schemas)
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },

    // University/Academic Fields (from first schema)
    university: {
      type: String,
      default: "TMV University",
    },
    semester: {
      type: String,
      default: "Semester 6",
    },
    course: {
      type: String,
      default: "BCA",
    },

    // Profile/Avatar Fields (from second schema)
    displayName: {
      type: String,
      default: function () {
        return this.name || this.username;
      },
    },
    avatar: {
      type: String,
      default: null, // Will store base64 or URL
    },
    avatarColor: {
      type: String,
      default: function () {
        // Generate random color for default avatar
        const colors = [
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#FFA07A",
          "#98D8C8",
          "#F7DC6F",
          "#BB8FCE",
          "#85C1E2",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      },
    },
    bio: {
      type: String,
      maxlength: 150,
      default: "",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  },
);

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (useful for sending user data to frontend)
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    displayName: this.displayName,
    avatar: this.avatar,
    avatarColor: this.avatarColor,
    bio: this.bio,
    university: this.university,
    semester: this.semester,
    course: this.course,
    lastSeen: this.lastSeen,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Update last seen timestamp
userSchema.methods.updateLastSeen = function () {
  this.lastSeen = Date.now();
  return this.save();
};
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);