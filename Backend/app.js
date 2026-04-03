import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./auth.js";
import userRoutes from "./Routes/user.routes.js";
import projectRoutes from "./Routes/Project.routes.js";
import aiRoutes from "./Routes/ai.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🔍 DEBUG ROUTE — remove after fixing
app.get("/debug-session", async (req, res) => {
  try {
    const { fromNodeHeaders } = await import("better-auth/node");
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    res.json({
      session: session,
      cookies: req.headers.cookie,
      headers: req.headers,
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ✅ Updated CORS — explicit origin function + all required headers
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        "http://localhost:5173",
        "https://dev-dialogue.vercel.app",
      ];
      // Allow requests with no origin (curl, mobile, server-to-server)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "x-requested-with",
    ],
  }),
);

// ✅ Better Auth handler — must be before express.json()
app.all("/api/auth/{*splat}", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Add this RIGHT AFTER app.use(cookieParser()) in app.js
app.get("/debug-session", async (req, res) => {
  try {
    const { fromNodeHeaders } = await import("better-auth/node");
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    res.json({
      session: session,
      cookiesReceived: req.headers.cookie || "NO COOKIES",
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("DevDialogue API is running");
});

export default app;
