import userModel from "../Models/user.model.js";
import * as userService from "../Services/user.service.js";
import { validationResult } from "express-validator";

// --- Get Profile ---
export const profileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Update Profile ---
export const updateProfileController = async (req, res) => {
  try {
    const { name, bio, settings, location, socials } = req.body;

    const updatedUser = await userModel
      .findByIdAndUpdate(
        req.user._id,
        { $set: { name, bio, location, socials, settings } },
        { new: true, runValidators: true },
      )
      .select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Delete Account ---
export const deleteAccountController = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Get All Users ---
export const getAllUsersController = async (req, res) => {
  try {
    const allUsers = await userService.getAllUsers({ userId: req.user._id });
    return res.status(200).json({ users: allUsers });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// --- Dashboard Stats ---
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await userService.getDashboardStats(req.user._id);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// --- Upload Avatar ---
export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const updatedUser = await userModel
      .findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true })
      .select("-password");

    res
      .status(200)
      .json({ message: "Avatar updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Delete Avatar ---
export const deleteAvatarController = async (req, res) => {
  try {
    const updatedUser = await userModel
      .findByIdAndUpdate(req.user._id, { avatar: null }, { new: true })
      .select("-password");

    res
      .status(200)
      .json({ message: "Avatar removed successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
