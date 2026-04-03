import mongoose from "mongoose";

// ✅ Back to standard ObjectId for all user references
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: [true, "Project name must be unique"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingInvites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        sender: { type: String, required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: { type: String, required: true },
        isAi: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
        replyTo: {
          originalMessage: { type: String },
          originalSender: { type: String },
        },
      },
    ],
    fileTree: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
