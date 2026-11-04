const config = require("../config");
const redis = require("../utils/redis");

// Fixed-window limiter, per client IP.
// Uses Redis when available (works across many servers), otherwise an in-memory Map.
const memory = new Map();

async function hit(key) {
  const { windowSeconds } = config.rateLimit;

  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSeconds);
      const ttl = await redis.ttl(key);
      return { count, retryAfter: ttl > 0 ? ttl : windowSeconds };
    } catch {
      // If Redis is down, fall back to memory instead of blocking every user
    }
  }

  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { count: 1, retryAfter: windowSeconds };
  }
  entry.count += 1;
  return { count: entry.count, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}

async function rateLimiter(req, res, next) {
  try {
    const { count, retryAfter } = await hit(`rl:${req.ip}`);
    if (count > config.rateLimit.maxRequests) {
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ error: `Too many requests. Try again in ${retryAfter}s.` });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = rateLimiter;
