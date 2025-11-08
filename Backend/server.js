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

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Or your frontend URL
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
    } // Check if user is part of the project

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
    next(new Error("Authentication error")); // Send generic error to client
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.projectIdString;

  console.log(
    `New user connected: ${socket.user.email} to project ${socket.projectIdString}`
  );

  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    // Check for AI prompt
    const message = data.message;
    const aiIsPresentInMessage = message.includes("@ai"); // --- THIS IS THE FIX --- // Handle AI prompts separately

    if (aiIsPresentInMessage) {
      try {
        const prompt = message.replace("@ai", "").trim(); // Get the prompt

        // 1. Immediately send the user's prompt to everyone
        // This lets others know what was asked
        io.to(socket.roomId).emit("project-message", {
          ...data,
          timestamp: new Date(),
        });

        // 2. Call the AI
        const result = await generateResult(prompt);

        // 3. Send the AI's response to everyone
        io.to(socket.roomId).emit("project-message", {
          message: result,
          sender: {
            _id: "ai",
            email: "AI",
          },
          timestamp: new Date(),
        });
      } catch (error) {
        // If AI fails, send an error message just to the sender
        console.error("AI Handler Error:", error.message);
        socket.emit("project-message", {
          message: "Sorry, the AI feature is not available right now.",
          sender: { _id: "ai-error", email: "AI Error" },
          timestamp: new Date(),
        });
      }
      return; // Stop execution to prevent broadcasting the '@ai' message again
    } // If it's a regular message, broadcast to everyone (including sender)
    // --- END OF FIX ---

    console.log(
      `Message received for project ${socket.projectIdString}:`,
      data.message
    );

    // Use io.to() to send to everyone in the room
    io.to(socket.roomId).emit("project-message", {
      ...data,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.user.email}. Reason: ${reason}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
