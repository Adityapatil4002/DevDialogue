import userModel from "../Models/user.model.js";
import * as userService from "../Services/user.service.js";
import { validationResult } from "express-validator";
import getRedisClient from "../Services/redis.service.js";

// AI usage config
const AI_LIMIT = 20;
const AI_WINDOW_SECONDS = 60 * 60; // 1 hour

const formatSeconds = (seconds) => {
  const total = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

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

// --- AI Usage Status ---
export const getAiUsageController = async (req, res) => {
  try {
    const redis = getRedisClient();

    // Same key pattern used in socket rate limiter
    const key = `ai_socket_rl:${req.user._id.toString()}`;

    if (!redis) {
      return res.status(200).json({
        limit: AI_LIMIT,
        used: 0,
        remaining: AI_LIMIT,
        resetInSeconds: 0,
        resetInHuman: "Unavailable",
        windowSeconds: AI_WINDOW_SECONDS,
        percentageUsed: 0,
        message: "Redis unavailable. Usage tracking temporarily unavailable.",
      });
    }

    const [usedRaw, ttlRaw] = await Promise.all([
      redis.get(key),
      redis.ttl(key),
    ]);

    const used = Math.max(0, parseInt(usedRaw || "0", 10));
    const remaining = Math.max(0, AI_LIMIT - used);
    const resetInSeconds = ttlRaw > 0 ? ttlRaw : 0;
    const percentageUsed = Math.min(100, Math.round((used / AI_LIMIT) * 100));

    return res.status(200).json({
      limit: AI_LIMIT,
      used,
      remaining,
      resetInSeconds,
      resetInHuman: resetInSeconds > 0 ? formatSeconds(resetInSeconds) : "Now",
      windowSeconds: AI_WINDOW_SECONDS,
      percentageUsed,
      isLimited: remaining <= 0,
    });
  } catch (error) {
    console.error("AI Usage Controller Error:", error.message);
    return res.status(500).json({
      error: "Failed to fetch AI usage",
    });
  }
};
