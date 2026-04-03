import mongoose from "mongoose";

// ✅ Back to standard Mongoose ObjectId — no more Clerk string IDs
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
    // NOTE: Password is managed by Better Auth in its own 'account' collection
    // We don't store or hash it here anymore

    name: {
      type: String,
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
      default: null,
    },
    socials: {
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
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
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
