import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";
import connect from "./db/db.js";
import {Server} from "socket.io";
import jwt from "jsonwebtoken";


const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
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

  socket.on('event', data => { });
  socket.on('disconnect', () => { });
});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
