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
      tls: {}, // ✅ Required for Redis Cloud — uses TLS/SSL
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

export { redisAvailable };
export default getRedisClient;
