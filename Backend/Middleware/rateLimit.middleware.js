import { checkRateLimit } from "../Services/redis.service.js";

// ─────────────────────────────────────────────────────────────
//  createRateLimiter
//
//  Factory that returns an Express middleware.
//
//  Options:
//    limit          → max requests per window
//    windowSeconds  → rolling window size in seconds
//    keyPrefix      → Redis key namespace  (e.g. "ai_rl")
//    getMessage     → optional fn(limit, windowSeconds) → string
//
//  Key is scoped to the authenticated user ID so different
//  users never share the same bucket.
// ─────────────────────────────────────────────────────────────
const createRateLimiter = ({ limit, windowSeconds, keyPrefix, getMessage }) => {
  return async (req, res, next) => {
    // req.user is set by authUser middleware which runs before this
    const userId = req.user?._id?.toString();

    if (!userId) {
      // Should never happen if authUser runs first, but guard anyway
      return res.status(401).json({ error: "Unauthorized" });
    }

    const key = `${keyPrefix}:${userId}`;
    const { allowed, current, ttl } = await checkRateLimit(
      key,
      limit,
      windowSeconds,
    );

    // Always attach informational headers so the frontend
    // can show "X requests remaining" if needed
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - current));
    res.setHeader("X-RateLimit-Reset", ttl); // seconds until window resets

    if (!allowed) {
      const defaultMessage =
        getMessage?.(limit, windowSeconds) ??
        `Rate limit exceeded. You can make ${limit} requests ` +
          `every ${windowSeconds} seconds. ` +
          `Try again in ${ttl} second${ttl === 1 ? "" : "s"}.`;

      return res.status(429).json({
        error: "RATE_LIMIT_EXCEEDED",
        message: defaultMessage,
        retryAfterSeconds: ttl,
        limit,
        current,
      });
    }

    next();
  };
};

// ─────────────────────────────────────────────────────────────
//  Preset — AI HTTP endpoint
//  20 requests per user per hour
// ─────────────────────────────────────────────────────────────
export const aiHttpRateLimiter = createRateLimiter({
  limit: 20,
  windowSeconds: 60 * 60, // 1 hour
  keyPrefix: "ai_rl",
  getMessage: (limit, windowSeconds) =>
    `You've used all ${limit} AI requests for this hour. ` +
    `Please wait before sending another AI message.`,
});

// ─────────────────────────────────────────────────────────────
//  Preset — AI Socket messages
//  Exported as a plain async function (not Express middleware)
//  so it can be called directly inside the socket handler.
//
//  Returns same shape as checkRateLimit:
//    { allowed, current, ttl }
// ─────────────────────────────────────────────────────────────
export const checkAiSocketRateLimit = async (userId) => {
  const key = `ai_socket_rl:${userId}`;

  // 20 AI socket messages per user per hour
  return checkRateLimit(key, 20, 60 * 60);
};

export default createRateLimiter;
