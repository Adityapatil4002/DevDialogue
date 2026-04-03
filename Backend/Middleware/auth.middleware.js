import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import userModel from "../Models/user.model.js";

export const authUser = async (req, res, next) => {
  try {
    // Better Auth reads the session from the cookie/header automatically
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized: No active session" });
    }
    // ✅ Find by EMAIL instead of ID — because Better Auth ID ≠ Mongoose _id
    let user = await userModel.findOne({ email: session.user.email });

    // ✅ If user doesn't exist in our DB yet, create them automatically
    if (!user) {
      user = await userModel.create({
        email: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
      });
    }
    // session.user.id is the Better Auth user ID (stored as _id in our User model)
    //const user = await userModel.findById(session.user.id);

    if (!user) {
      return res.status(401).json({ error: "User not found in database" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(500).json({ error: "Server error during authentication" });
  }
};
