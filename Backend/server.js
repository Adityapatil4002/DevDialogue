import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import connect from "./db/db.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import userModel from "./Models/user.model.js";
import projectModel from "./Models/project.model.js";
import { generateResult } from "./Services/ai.service.js";
import * as projectService from "./Services/project.service.js";
import { auth } from "./auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { checkAiSocketRateLimit } from "./Middleware/rateLimit.middleware.js";

connect();

const port = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://dev-dialogue.vercel.app",
      "https://devdialogue.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─────────────────────────────────────────────────────────────
//  Socket Auth Middleware
//  Verifies Better Auth session from Bearer token,
//  finds user in MongoDB, confirms project membership.
// ─────────────────────────────────────────────────────────────
io.use(async (socket, next) => {
  try {
    const projectId = socket.handshake.query.projectId;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    socket.projectIdString = projectId.toString();

    const project = await projectModel.findById(projectId);
    if (!project) {
      return next(new Error("Project not found"));
    }

    // ✅ Extract the Bearer token sent from the frontend socket auth payload
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    // ✅ Read session using the authorization header instead of cookies
    const session = await auth.api.getSession({
      headers: fromNodeHeaders({ authorization: `Bearer ${token}` }),
    });

    if (!session || !session.user) {
      return next(new Error("Authentication error: No active session"));
    }

    // Find by EMAIL — Better Auth ID !== Mongoose _id
    let dbUser = await userModel.findOne({ email: session.user.email });

    // Auto-create if not found
    if (!dbUser) {
      dbUser = await userModel.create({
        email: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
      });
      console.log("✅ Auto-created user in DB:", session.user.email);
    }

    const isUserInProject = project.users.some(
      (userId) => userId.toString() === dbUser._id.toString(),
    );

    if (!isUserInProject) {
      return next(
        new Error("Authentication error: User is not a project member"),
      );
    }

    socket.user = dbUser;
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    next(new Error("Authentication error: " + error.message));
  }
});

// ─────────────────────────────────────────────────────────────
//  Socket Connection Handler
// ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  socket.roomId = socket.projectIdString;
  console.log(
    `✅ User connected: ${socket.user.email} → project ${socket.roomId}`,
  );

  socket.join(socket.roomId);

  // ── Typing indicators ──────────────────────────────────────
  socket.on("typing", () => {
    socket.to(socket.roomId).emit("typing", { email: socket.user.email });
  });

  socket.on("stop-typing", () => {
    socket.to(socket.roomId).emit("stop-typing", { email: socket.user.email });
  });

  // ── Main message handler ───────────────────────────────────
  socket.on("project-message", async (data) => {
    const { message, replyTo } = data;

    if (!message || typeof message !== "string") return;

    // Strip AI context block before saving to DB
    // The frontend appends file contents after "***\nCONTEXT FOR AI"
    const contextDelimiter = "***\nCONTEXT FOR AI";
    const messageForDb = message.includes(contextDelimiter)
      ? message.split(contextDelimiter)[0].trim()
      : message;

    const aiIsPresentInMessage = messageForDb.toLowerCase().includes("@ai");

    const projectId = socket.projectIdString;

    try {
      // ── AI Rate Limit Check ──────────────────────────────
      if (aiIsPresentInMessage) {
        const userId = socket.user._id.toString();
        const { allowed, ttl, current } = await checkAiSocketRateLimit(userId);

        if (!allowed) {
          socket.emit("ai-rate-limit-error", {
            message:
              `You've reached the AI usage limit (20 messages/hour). ` +
              `Please wait ${ttl} second${ttl === 1 ? "" : "s"} ` +
              `before sending another @ai message.`,
            retryAfterSeconds: ttl,
            current,
            limit: 20,
          });

          return;
        }
      }

      // ── Save user message to DB ──────────────────────────
      const savedMsg = await projectService.addMessage({
        projectId,
        sender: socket.user.email,
        senderId: socket.user._id,
        message: messageForDb,
        isAi: false,
        replyTo,
      });

      // Broadcast user message to everyone in the room
      io.to(socket.roomId).emit("project-message", {
        _id: savedMsg._id,
        message: messageForDb,
        sender: { _id: socket.user._id, email: socket.user.email },
        timestamp: savedMsg.timestamp,
        isAi: false,
        replyTo,
      });

      // ── Call Gemini + broadcast AI response ─────────────
      if (aiIsPresentInMessage) {
        const prompt = message.replace(/@ai/i, "").trim();
        const result = await generateResult(prompt);

        const savedAiMsg = await projectService.addMessage({
          projectId,
          sender: "AI",
          senderId: null,
          message: result.message || JSON.stringify(result),
          isAi: true,
        });

        io.to(socket.roomId).emit("project-message", {
          _id: savedAiMsg._id,
          ...result,
          isAi: true,
          sender: { _id: "ai", email: "AI" },
          timestamp: savedAiMsg.timestamp,
        });
      }
    } catch (err) {
      console.error("❌ Message Error:", err.message);
    }
  });

  // ── Delete message ─────────────────────────────────────────
  socket.on("delete-message", async (data) => {
    const { messageId } = data;
    if (!messageId) return;

    try {
      await projectService.deleteMessage({
        projectId: socket.projectIdString,
        messageId,
      });

      io.to(socket.roomId).emit("message-deleted", { messageId });
    } catch (err) {
      console.error("❌ Delete Message Error:", err.message);
    }
  });

  // ── Disconnect ─────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected: ${socket.user.email} (${reason})`);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
