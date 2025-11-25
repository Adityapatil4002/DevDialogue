import projectModel from "../Models/project.model.js";
import * as projectService from "../Services/project.service.js";
import userModel from "../Models/user.model.js";
import { validationResult } from "express-validator";

export const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({
      name,
      userId,
    });
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).send(err.message);
    console.log(err);
  }
};

// [UPDATED] Get Projects AND Invites
export const getAllProjects = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    // 1. Find projects where user is a full member
    const projects = await projectModel.find({
      users: loggedInUser._id,
    });

    // 2. Find projects where user has a pending invite
    const invites = await projectModel.find({
      pendingInvites: loggedInUser._id,
    });

    return res.status(200).json({
      projects: projects,
      invites: invites, // Send invites separately
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

// [NEW] Secure Search - Only returns if EXACT email match
export const getUserByExactEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await userModel.findOne({ email: email }).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// [NEW] Send Invite instead of direct add
export const sendInvite = async (req, res) => {
  try {
    const { projectId, email } = req.body; // Receive email, not ID for better UX

    const userToInvite = await userModel.findOne({ email });
    if (!userToInvite)
      return res.status(404).json({ message: "User not found" });

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if already a member
    if (project.users.includes(userToInvite._id)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Check if already invited
    if (project.pendingInvites.includes(userToInvite._id)) {
      return res.status(400).json({ message: "Invite already sent" });
    }

    // Add to pending invites
    project.pendingInvites.push(userToInvite._id);
    await project.save();

    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// [NEW] Accept Invite
export const acceptInvite = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user._id;

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.pendingInvites.includes(userId)) {
      return res.status(400).json({ message: "No invite found" });
    }

    // Move from Pending to Users
    project.pendingInvites = project.pendingInvites.filter(
      (id) => id.toString() !== userId.toString()
    );
    project.users.push(userId);
    await project.save();

    res.status(200).json({ message: "Joined project successfully", project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// [NEW] Reject Invite
export const rejectInvite = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user._id;

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Remove from pending
    project.pendingInvites = project.pendingInvites.filter(
      (id) => id.toString() !== userId.toString()
    );
    await project.save();

    res.status(200).json({ message: "Invitation rejected" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Keep existing functions
export const getProjectById = async (req, res) => {
  const { projectId } = req.params;
  try {
    const userId = req.user._id;
    const project = await projectService.getProjectById(projectId, userId);
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or access denied" });
    }
    return res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const updateFileTree = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { projectId, fileTree } = req.body;
    const project = await projectService.updateFileTree({
      projectId,
      fileTree,
    });
    return res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
