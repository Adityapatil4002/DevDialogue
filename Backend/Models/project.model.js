import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: [true, "Project name must be unique"],
  },
  // [NEW] Add Owner Field
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
  fileTree: {
    type: Object,
    default: {},
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
