import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import userRoutes from "./Routes/User.routes.js";
import projectRoutes from "./Routes/Project.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

connect();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev")); 

app.use("/user", userRoutes);
app.use("/project", projectRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
