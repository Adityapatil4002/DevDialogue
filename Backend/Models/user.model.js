import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minLength: [6, "Email must be at least 6 character long"],
    maxLength: [50, "Email must be at most 50 character long"],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  // --- NEW FIELDS ADDED FOR PROFILE PAGE ---
  name: {
    type: String,
    // Default to the part of email before '@' if not provided
    default: function () {
      return this.email ? this.email.split("@")[0] : "Developer";
    },
  },
  bio: {
    type: String,
    default: "I am a developer using DevDialogue.",
  },
  avatar: {
    type: String,
    default: null, // Frontend will handle default image if null
  },
  settings: {
    theme: {
      type: String,
      default: "dracula",
      enum: ["dracula", "monokai", "github-dark"], // Restrict to valid themes
    },
    fontSize: {
      type: Number,
      default: 14,
    },
    aiModel: {
      type: String,
      default: "gemini-pro",
    },
  },
});

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
