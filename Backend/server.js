import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";
import connect from "./db/db.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./Models/project.model.js";
import { generateResult } from "./Services/ai.service.js";
import * as projectService from "./Services/project.service.js";

const port = process.env.PORT || 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];
    const projectId = socket.handshake.query.projectId;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    socket.projectIdString = projectId.toString();

    const project = await projectModel.findById(projectId);
    if (!project) {
      return next(new Error("Project not found"));
    }

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded._id) {
      return next(new Error("Authentication error: Invalid token"));
    }

    const isUserInProject = project.users.some(
      (userId) => userId.toString() === decoded._id
    );

    if (!isUserInProject) {
      return next(new Error("Authentication error: User not in project"));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.projectIdString;
  console.log(
    `User connected: ${socket.user.email} to project ${socket.roomId}`
  );

  socket.join(socket.roomId);

  socket.on("typing", () => {
    socket.to(socket.roomId).emit("typing", { email: socket.user.email });
  });

  socket.on("stop-typing", () => {
    socket.to(socket.roomId).emit("stop-typing", { email: socket.user.email });
  });

  socket.on("project-message", async (data) => {
    const message = data.message;

    // --- [NEW] INTELLIGENT PARSING ---
    // Check if the message contains the hidden context block we added in frontend
    const contextDelimiter = "***\nCONTEXT FOR AI";
    const hasContext = message.includes(contextDelimiter);

    // 1. Prepare Message for HUMANS (DB & Broadcast)
    // If context exists, we strip it out so the chat log stays clean.
    let messageForDb = message;
    if (hasContext) {
      messageForDb = message.split(contextDelimiter)[0].trim();
    }

    const aiIsPresentInMessage = messageForDb.includes("@ai");
    const projectId = socket.projectIdString;

    try {
      // 2. SAVE CLEAN USER MESSAGE TO DB
      await projectService.addMessage({
        projectId,
        sender: socket.user.email,
        senderId: socket.user._id,
        message: messageForDb, // Saving only the clean text
        isAi: false,
      });

      // 3. BROADCAST CLEAN USER MESSAGE
      // This ensures other users don't see the massive code block in the chat bubble
      io.to(socket.roomId).emit("project-message", {
        message: messageForDb,
        sender: { _id: socket.user._id, email: socket.user.email },
        timestamp: new Date(),
        isAi: false,
      });

      // 4. HANDLE AI
      if (aiIsPresentInMessage) {
        // --- PREPARE PROMPT FOR AI ---
        // We want to remove "@ai" but KEEP the context/code if it exists.
        // We use the ORIGINAL 'message' variable which still has the code.
        const prompt = message.replace("@ai", "").trim();

        console.log("🤖 AI Prompt received. Has context:", hasContext);

        const result = await generateResult(prompt);

        // 5. SAVE AI RESPONSE TO DB
        await projectService.addMessage({
          projectId,
          sender: "AI",
          senderId: null,
          message: result.message || JSON.stringify(result),
          isAi: true,
        });

        // 6. BROADCAST AI MESSAGE
        io.to(socket.roomId).emit("project-message", {
          ...result,
          isAi: true,
          sender: { _id: "ai", email: "AI" },
          timestamp: new Date(),
        });
      }
    } catch (err) {
      console.error("Message Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.email}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
