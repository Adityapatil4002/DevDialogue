import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import userRoutes from "./Routes/User.routes.js";
import projectRoutes from "./Routes/Project.routes.js";
import cookieParser from "cookie-parser";
import aiRoutes from "./Routes/ai.routes.js";
import cors from "cors";

// --- FIX START: Import Path & URL ---
import path from "path";
import { fileURLToPath } from "url";

// --- FIX: Define __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- FIX END ---

connect();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// --- FIX: Serve the 'uploads' folder publicly ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
