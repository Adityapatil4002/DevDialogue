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

    // Check if user is part of the project (Active users only)
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
    `New user connected: ${socket.user.email} to project ${socket.projectIdString}`
  );

  socket.join(socket.roomId);

  // [NEW] Typing Indicators
  socket.on("typing", () => {
    // Broadcast to everyone EXCEPT the sender
    socket.to(socket.roomId).emit("typing", {
      email: socket.user.email,
    });
  });

  socket.on("stop-typing", () => {
    socket.to(socket.roomId).emit("stop-typing", {
      email: socket.user.email,
    });
  });

  socket.on("project-message", async (data) => {
    const message = data.message;
    const aiIsPresentInMessage = message.includes("@ai");

    if (aiIsPresentInMessage) {
      try {
        const prompt = message.replace("@ai", "").trim();

        io.to(socket.roomId).emit("project-message", {
          ...data,
          timestamp: new Date(),
        });

        const result = await generateResult(prompt);

        io.to(socket.roomId).emit("project-message", result);
      } catch (error) {
        console.error("AI Handler Error:", error.message);
        socket.emit("project-message", {
          message: JSON.stringify({
            text: "Sorry, the AI feature is not available right now.",
          }),
          isAi: true,
          sender: { _id: "ai-error", email: "AI Error" },
          timestamp: new Date(),
        });
      }
      return;
    }

    console.log(
      `Message received for project ${socket.projectIdString}:`,
      data.message
    );

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
