const Redis = require("ioredis");
const config = require("../config");

// Redis is optional: without REDIS_URL the app uses MongoDB + an in-memory rate limiter.
const redis = config.redisUrl
  ? new Redis(config.redisUrl, { maxRetriesPerRequest: 2, enableOfflineQueue: false })
  : null;

if (redis) {
  redis.on("error", (err) => console.error("[redis] error:", err.message));
  redis.on("ready", () => console.log("[redis] connected"));
}

module.exports = redis;
