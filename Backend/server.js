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

// 

//[Image of Socket.io Architecture]
//- Visualizing the connection flow
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
  console.log(`✅ User connected: ${socket.user.email} to project ${socket.roomId}`);

  socket.join(socket.roomId);

  // --- TYPING INDICATORS ---
  socket.on("typing", () => {
    socket.to(socket.roomId).emit("typing", { email: socket.user.email });
  });

  socket.on("stop-typing", () => {
    socket.to(socket.roomId).emit("stop-typing", { email: socket.user.email });
  });

  // --- MESSAGE HANDLING (Chat + AI) ---
  socket.on("project-message", async (data) => {
    try {
      const { message, replyTo } = data; 

      // Safety check
      if (!message) return;

      // 1. Intelligent Parsing: Separate Context from Message
      // We appended context in frontend using this delimiter
      const contextDelimiter = "***\nCONTEXT FOR AI";
      const hasContext = message.includes(contextDelimiter);
      
      let messageForDb = message;
      
      // If context exists, strip it out for the DB and human readers
      if (hasContext) {
        messageForDb = message.split(contextDelimiter)[0].trim();
      }

      const aiIsPresentInMessage = messageForDb.includes("@ai");
      const projectId = socket.projectIdString;

      // 2. Save User Message (Clean Version)
      const savedMsg = await projectService.addMessage({
        projectId,
        sender: socket.user.email,
        senderId: socket.user._id,
        message: messageForDb, // Save only the chat text, not the massive file code
        isAi: false,
        replyTo, // Save reply context
      });

      // 3. Broadcast to Room (Clean Version)
      io.to(socket.roomId).emit("project-message", {
        _id: savedMsg._id, // Important for deletion
        message: messageForDb,
        sender: { _id: socket.user._id, email: socket.user.email },
        timestamp: new Date(),
        isAi: false,
        replyTo,
      });

      // 4. AI Logic (If invoked)
      if (aiIsPresentInMessage) {
        
        // Prepare prompt: Remove "@ai" but KEEP the context/code for the AI to read
        const prompt = message.replace("@ai", "").trim();
        console.log("🤖 AI Invoked. Has Context:", hasContext);

        // Call Gemini
        const result = await generateResult(prompt);

        // Save AI Response
        const savedAiMsg = await projectService.addMessage({
          projectId,
          sender: "AI",
          senderId: null,
          message: result.message || JSON.stringify(result),
          isAi: true,
        });

        // Broadcast AI Response
        io.to(socket.roomId).emit("project-message", {
          _id: savedAiMsg._id,
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

  // --- DELETE MESSAGE HANDLING ---
  socket.on("delete-message", async (data) => {
    try {
      const { messageId } = data;
      const projectId = socket.projectIdString;
      
      await projectService.deleteMessage({ projectId, messageId });
      
      // Notify all clients to remove this message ID
      io.to(socket.roomId).emit("message-deleted", { messageId });
      console.log(`🗑️ Message deleted: ${messageId}`);
    } catch (err) {
      console.error("Delete Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.user.email}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});