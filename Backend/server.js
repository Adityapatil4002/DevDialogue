import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";
import connect from "./db/db.js";
import {Server} from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./Models/project.model.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.use(async(socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    socket.projectId = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(!decoded || !decoded._id) {
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.user = decoded;
    next();

  } catch (error) {
    next(error);
    
  }
})

io.on('connection', socket => {

  console.log('New user connected');

  socket.join(socket.projectId._id.toString());

  socket.on('project-message', data => {
    socket.broadcast.to(socket.projectId._id.toString()).emit('project-message', data);
  
  })



  socket.on('event', data => { });
  socket.on('disconnect', () => { });
});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
