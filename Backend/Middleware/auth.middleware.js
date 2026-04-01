import { clerkMiddleware, requireAuth } from "@clerk/express";
import userModel from "../Models/user.model.js";

export const authUser = [
  // 1. ADD THIS: This engine actually parses the token from the headers
  clerkMiddleware(),

  // 2. Reject the request if the parsed token is invalid or missing
  requireAuth(),

  // 3. Our Bridge: Grab the ID and attach your MongoDB user
  async (req, res, next) => {
    try {
      const clerkUserId = req.auth.userId;

      if (!clerkUserId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No Clerk ID found" });
      }

      const user = await userModel.findById(clerkUserId);

      if (!user) {
        return res
          .status(401)
          .json({ error: "User not synced to database yet" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Auth Bridge Error:", error);
      res
        .status(500)
        .json({ error: "Server error during authentication bridge" });
    }
  },
];
