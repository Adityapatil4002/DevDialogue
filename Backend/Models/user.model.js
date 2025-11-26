import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: [6, "Email must be at least 6 characters long"],
      maxLength: [50, "Email must be at most 50 characters long"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    // --- PROFILE FIELDS ---
    name: {
      type: String,
      // Automatically set a default name based on email if none provided
      default: function () {
        return this.email ? this.email.split("@")[0] : "Developer";
      },
    },
    bio: {
      type: String,
      default: "I am a developer using DevDialogue.",
    },
    location: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: null, // We are using initials now, but keeping this field is good for future upgrades
    },

    // --- SOCIAL LINKS ---
    socials: {
      github: { type: String, default: "" },
      twitter: { type: String, default: "" }, // Added this to match frontend
      linkedin: { type: String, default: "" },
    },

    // --- EDITOR SETTINGS ---
    settings: {
      theme: {
        type: String,
        default: "dracula",
        enum: ["dracula", "monokai", "github-dark"],
      },
      fontSize: { type: Number, default: 14 },
      aiModel: { type: String, default: "gemini-pro" },
      wordWrap: { type: Boolean, default: true },
      showLineNumbers: { type: Boolean, default: true },
      cursorStyle: { type: String, default: "line" },
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt automatically

// --- STATIC METHODS ---
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// --- INSTANCE METHODS ---
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
