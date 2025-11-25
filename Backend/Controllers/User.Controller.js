import userModel from "../Models/user.model.js";
import * as userService from "../Services/User.service.js";
import { validationResult } from "express-validator";
import redisClient from "../Services/redis.service.js";
import projectModel from "../Models/project.model.js";

export const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await userService.createUser(req.body);
    const token = await user.generateJWT();
    delete user._doc.password;
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        errors: "Invalid credentials",
      });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        errors: "Invalid credentials",
      });
    }

    const token = await user.generateJWT();
    delete user._doc.password;
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// --- Get Full Profile Data ---
export const profileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// --- Update Profile & Settings ---
export const updateProfileController = async (req, res) => {
  try {
    const userId = req.user._id;
    // [UPDATED] Destructure all new fields (location, socials)
    const { name, bio, settings, location, socials } = req.body;

    // Find user and update
    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            name: name,
            bio: bio,
            location: location, // Added
            socials: socials, // Added
            settings: settings,
          },
        },
        { new: true, runValidators: true }
      )
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// --- [NEW] Change Password ---
export const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // 1. Get user with password field included
    const user = await userModel.findById(userId).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Validate Current Password
    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ error: "Incorrect current password" });

    // 3. Hash New Password & Save
    user.password = await userModel.hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// --- [NEW] Delete Account ---
export const deleteAccountController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete the user from MongoDB
    await userModel.findByIdAndDelete(userId);

    // Optionally black list the token in Redis here if you want extra security
    // const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    // redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const allUsers = await userService.getAllUsers({
      userId: loggedInUser._id,
    });

    return res.status(200).json({
      users: allUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all projects for the user
    const projects = await projectModel
      .find({ users: userId })
      .populate("users", "email");

    // 2. Calculate Basic Stats
    const totalProjects = projects.length;

    // Calculate unique collaborators (excluding the current user)
    const collaboratorSet = new Set();
    projects.forEach((project) => {
      project.users.forEach((u) => {
        if (u._id.toString() !== userId.toString()) {
          collaboratorSet.add(u.email);
        }
      });
    });
    const totalCollaborators = collaboratorSet.size;

    // 3. Calculate File & Language Stats
    let totalFiles = 0;
    const languageMap = {};

    // Helper to traverse file tree
    const traverseTree = (tree) => {
      for (const key in tree) {
        if (tree[key].file) {
          totalFiles++;
          const ext = key.split(".").pop() || "plaintext";
          const lang = getLanguageName(ext);
          languageMap[lang] = (languageMap[lang] || 0) + 1;
        } else if (tree[key].directory) {
          traverseTree(tree[key].directory);
        }
      }
    };

    projects.forEach((project) => {
      if (project.fileTree) {
        traverseTree(project.fileTree);
      }
    });

    // Format language stats for the chart (Top 5 + Others)
    const sortedLanguages = Object.entries(languageMap).sort(
      ([, a], [, b]) => b - a
    );
    const topLanguages = sortedLanguages
      .slice(0, 5)
      .map(([label, data]) => ({ label, data }));
    const otherCount = sortedLanguages
      .slice(5)
      .reduce((sum, [, data]) => sum + data, 0);
    if (otherCount > 0) {
      topLanguages.push({ label: "Other", data: otherCount });
    }

    // 4. Calculate 30-Day Activity (Project Creation Trend)
    const activityMap = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      activityMap[d.toISOString().split("T")[0]] = 0;
    }

    projects.forEach((project) => {
      const dateStr = project.createdAt.toISOString().split("T")[0];
      if (activityMap[dateStr] !== undefined) {
        activityMap[dateStr]++;
      }
    });

    const activityChartData = Object.keys(activityMap).map((date) => ({
      date,
      count: activityMap[date],
    }));

    res.status(200).json({
      totalProjects,
      totalCollaborators,
      totalFiles,
      languageStats: topLanguages,
      activityChartData,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// Helper function to map extensions to language names
const getLanguageName = (ext) => {
  const map = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    html: "HTML",
    css: "CSS",
    scss: "CSS",
    json: "JSON",
    md: "Markdown",
    py: "Python",
    java: "Java",
    c: "C",
    cpp: "C++",
    go: "Go",
    rs: "Rust",
    php: "PHP",
    rb: "Ruby",
    sql: "SQL",
  };
  return map[ext.toLowerCase()] || "Other";
};