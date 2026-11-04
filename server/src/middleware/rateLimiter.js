const config = require("../config");

const memory = new Map();
const redis = null;

async function hit(key) {
  const { windowSeconds } = config.rateLimit;

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
