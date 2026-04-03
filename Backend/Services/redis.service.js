import Redis from "ioredis";

let redisClient = null;

// ✅ Lazy initialization — Redis only connects when first called,
// ensuring dotenv has already loaded all env vars before this runs.
const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      // ✅ Prevent infinite reconnect spam if Redis is down
      retryStrategy: (times) => {
        if (times > 3) {
          console.error("❌ Redis: Max retries reached. Giving up.");
          return null; // Stop retrying
        }
        return Math.min(times * 500, 2000); // Wait before retrying
      },
    });

    redisClient.on("connect", () => {
      console.log("✅ Connected to Redis");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis connection error:", err.message);
    });
  }

  return redisClient;
};

export default getRedisClient;
