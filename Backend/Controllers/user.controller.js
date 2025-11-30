import userModel from "../Models/user.model.js";
import * as userService from "../Services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../Services/redis.service.js";

// --- Create User ---
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

// --- Login ---
export const loginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }

    const token = await user.generateJWT();
    delete user._doc.password;
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// --- Get Profile ---
export const profileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// --- Update Profile ---
export const updateProfileController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, settings, location, socials } = req.body;

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            name,
            bio,
            location,
            socials,
            settings,
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

// --- Change Password ---
export const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ error: "Incorrect current password" });

    user.password = await userModel.hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// --- Delete Account ---
export const deleteAccountController = async (req, res) => {
  try {
    const userId = req.user._id;
    await userModel.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// --- Logout ---
export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    redisClient.set(token, "logout", "EX", 60 * 60 * 24);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

// --- Get All Users ---
export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const allUsers = await userService.getAllUsers({
      userId: loggedInUser._id,
    });

    return res.status(200).json({ users: allUsers });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

// --- [CLEANED] Dashboard Stats ---
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    // Controller logic is now simple: Ask Service for data, return it.
    const stats = await userService.getDashboardStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};


export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user._id;
    // Construct the full URL to the uploaded file
    // Note: In production, you might upload to Cloudinary/S3 instead.
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ... existing imports

// [NEW] Delete Avatar
export const deleteAvatarController = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { avatar: null }, // Set avatar to null
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Avatar removed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};