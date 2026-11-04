require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/snip",
  redisUrl: process.env.REDIS_URL || "",
  baseUrl: (process.env.BASE_URL || "http://localhost:5000").replace(/\/$/, ""),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  codeLength: 7,
  cacheTtlSeconds: 60 * 60 * 24, // 24 hours
  rateLimit: { windowSeconds: 60, maxRequests: 10 },
};
