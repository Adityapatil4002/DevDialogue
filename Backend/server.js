import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";
import connect from "./db/db.js";


const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = require("socket.io")(server);

io.on('connection', socket => {

  console.log('New user connected');

  client.on('event', data => { });
  client.on('disconnect', () => { });
});



server.listen(port, () => {
  console.log("Server is running on port 3000");
});
