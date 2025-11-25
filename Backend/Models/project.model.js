import mongoose from "mongoose";

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
    // [NEW] Store Chat History
    messages: [
      {
        sender: {
          type: String, // We store email or "AI" for simplicity in display
          required: true,
        },
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false, // Optional because AI has no ID
        },
        message: {
          type: String,
          required: true,
        },
        isAi: {
          type: Boolean,
          default: false,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    fileTree: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt automatically

const Project = mongoose.model("Project", projectSchema);

export default Project;
