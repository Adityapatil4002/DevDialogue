import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";
import connect from "./db/db.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./Models/project.model.js";

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

    // Store the ID as a string for consistency
    socket.projectIdString = projectId.toString();

    // Check if project exists
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

    // Check if user is part of the project
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
  console.log(
    `New user connected: ${socket.user.email} to project ${socket.projectIdString}`
  );

  // Join the room using the stored string
  socket.join(socket.projectIdString);

  // --- THIS IS THE FIX ---
  socket.on("project-message", (data) => {
    // Add this log so you can see it arrive!
    console.log(
      `Message received for project ${socket.projectIdString}:`,
      data.message
    );

    // Use io.to() to send to EVERYONE in the room (including sender)
    io.to(socket.projectIdString).emit("project-message", {
      ...data,
      timestamp: new Date(), // Add a server timestamp
    });
  });
  // --- END OF FIX ---

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.user.email}. Reason: ${reason}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
