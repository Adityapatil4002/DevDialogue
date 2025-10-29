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
      return next(new Error("Invalid projectId format"));
    }

    const projectExists = await projectModel.findById(projectId).lean(); // Use lean for read-only check
    if (!projectExists) {
      return next(new Error("Project not found"));
    }
    socket.projectIdString = projectId.toString();

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded._id) {
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.user = decoded; 
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("Authentication error: Token expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new Error("Authentication error: Invalid token"));
    }
    console.error("Socket Auth Error:", error); 
    next(new Error("Authentication error")); 
  }
});

io.on("connection", (socket) => {
  console.log(
    `User connected: ${socket.user.email} to project ${socket.projectIdString}`
  );

  socket.join(socket.projectIdString);

  socket.on("project-message", (data) => {
    // Log received message for debugging
    console.log(`Message received in room ${socket.projectIdString}:`, data);

    if (
      !data ||
      typeof data.message !== "string" ||
      !data.sender ||
      typeof data.sender.email !== "string"
    ) {
      console.error("Invalid message format received:", data);
      return;
    }

    io.to(socket.projectIdString).emit("project-message", {
      ...data,
      timestamp: new Date(), 
    });
  }); 

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.user.email}. Reason: ${reason}`);
    
  });

  socket.on("error", (error) => {
    console.error(`Socket error for user ${socket.user?.email}:`, error);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
