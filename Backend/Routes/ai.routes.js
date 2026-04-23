import { Router } from "express";
import * as aiController from "../Controllers/ai.controller.js";
import { authUser } from "../Middleware/auth.middleware.js";
import { aiHttpRateLimiter } from "../Middleware/rateLimit.middleware.js";

const router = Router();

// Auth → Rate limit → Handler
// Order matters: auth first so rate limiter has req.user
router.get(
  "/get-result",
  authUser, // 1. verify session
  aiHttpRateLimiter, // 2. check 20-req/hr bucket
  aiController.getResult, // 3. call Gemini
);

export default router;
