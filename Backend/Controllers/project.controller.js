import projectModel from "../Models/project.model.js";
import * as projectService from "../Services/project.service.js";
import userModel from "../Models/user.model.js";
import { validationResult } from "express-validator";

// ... imports

export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id;

        const newProject = await projectService.createProject({
            name,
            userId
        })
        
        // [FIX] Ensure Owner is set (Service usually handles this, but ensure it's saved)
        // If your service does it, great. If not, make sure newProject.owner = userId
        
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).send(err.message);
        console.log(err);
    }
}

// [NEW] Leave Project (For Collaborators)
export const leaveProject = async (req, res) => {
    try {
        const { projectId } = req.body;
        const userId = req.user._id;

        const project = await projectModel.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Prevent Owner from leaving (They must delete)
        if (project.owner.toString() === userId.toString()) {
            return res.status(400).json({ message: "Owner cannot leave project. Delete it instead." });
        }

        // Remove user from users array
        project.users = project.users.filter(id => id.toString() !== userId.toString());
        await project.save();

        res.status(200).json({ message: "Left project successfully" });

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}

// [NEW] Delete Project (Owner Only)
export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.body; // or req.params
        const userId = req.user._id;

        const project = await projectModel.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check Ownership
        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the owner can delete this project." });
        }

        await projectModel.findByIdAndDelete(projectId);

        res.status(200).json({ message: "Project deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
}

// ... (Keep getAllProjects, sendInvite, etc.)

export const getAllProjects = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const projects = await projectModel.find({
      users: loggedInUser._id,
    });

    const invites = await projectModel.find({
      pendingInvites: loggedInUser._id,
    });

    return res.status(200).json({
      projects: projects,
      invites: invites,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

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

// --- NEW FEATURES ---

export const getUserByExactEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await userModel.findOne({ email: email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const sendInvite = async (req, res) => {
  try {
    const { projectId, email } = req.body;
    const userToInvite = await userModel.findOne({ email });
    if (!userToInvite)
      return res.status(404).json({ message: "User not found" });

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.users.includes(userToInvite._id)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    if (project.pendingInvites.includes(userToInvite._id)) {
      return res.status(400).json({ message: "Invite already sent" });
    }

    project.pendingInvites.push(userToInvite._id);
    await project.save();

    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user._id;

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.pendingInvites.includes(userId)) {
      return res.status(400).json({ message: "No invite found" });
    }

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

export const rejectInvite = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user._id;

    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.pendingInvites = project.pendingInvites.filter(
      (id) => id.toString() !== userId.toString()
    );
    await project.save();

    res.status(200).json({ message: "Invitation rejected" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
