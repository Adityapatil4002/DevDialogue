import Redis from "ioredis";

let redisClient = null;
let redisAvailable = false;

const getRedisClient = () => {
  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    console.warn("⚠️ Redis env vars not set. Running without cache.");
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      tls: {},
      connectTimeout: 10000,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error(
            "❌ Redis: Max retries reached. Running without cache.",
          );
          redisAvailable = false;
          return null;
        }
        return Math.min(times * 500, 2000);
      },
    });

    redisClient.on("connect", () => {
      console.log("✅ Connected to Redis Cloud");
      redisAvailable = true;
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
      redisAvailable = false;
    });

    redisClient.on("close", () => {
      redisAvailable = false;
    });

    redisClient.connect().catch((err) => {
      console.error("❌ Redis connection failed:", err.message);
      redisAvailable = false;
    });
  }

  return redisAvailable ? redisClient : null;
};

// ─────────────────────────────────────────────────────────────
//  Rate Limit Helper
//  Uses a simple fixed window counter stored in Redis.
//
//  key            → unique string (e.g. "ai_rl:userId123")
//  limit          → max hits allowed in the window
//  windowSeconds  → window size in seconds
//
//  Returns:
//    { allowed: boolean, current: number, ttl: number }
//
//  Strategy — "fail open":
//    If Redis is unavailable we let the request through rather
//    than blocking all users because of an infra issue.
// ─────────────────────────────────────────────────────────────
export const checkRateLimit = async (key, limit, windowSeconds) => {
  const client = getRedisClient();

  // Redis is down → fail open (don't punish users for infra issues)
  if (!client) {
    console.warn("⚠️ Rate limit skipped — Redis unavailable");
    return { allowed: true, current: 0, ttl: windowSeconds };
  }

  try {
    // Atomic pipeline: increment counter + set TTL only on first hit
    const pipeline = client.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);
    const [[incrErr, current], [ttlErr, ttl]] = await pipeline.exec();

    if (incrErr || ttlErr) throw incrErr || ttlErr;

    // First hit in this window — set the expiry
    if (ttl === -1) {
      await client.expire(key, windowSeconds);
    }

    const allowed = current <= limit;
    const effectiveTtl = ttl === -1 ? windowSeconds : ttl;

    return { allowed, current, ttl: effectiveTtl };
  } catch (err) {
    // Any unexpected error → fail open
    console.error("❌ checkRateLimit error:", err.message);
    return { allowed: true, current: 0, ttl: windowSeconds };
  }
};

export { redisAvailable };
export default getRedisClient;
