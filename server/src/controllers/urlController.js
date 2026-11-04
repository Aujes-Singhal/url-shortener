const config = require("../config");
const Url = require("../models/Url");
const AppError = require("../utils/AppError");
const { generateCode, isValidCode } = require("../utils/generateCode");
const redis = require("../utils/redis");

const MAX_COLLISION_RETRIES = 5;
const cacheKey = (code) => `url:${code}`;

// Lets async handlers throw and have Express send the error to errorHandler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

function validateUrl(input) {
  if (typeof input !== "string" || !input.trim()) {
    throw new AppError(400, "Enter a URL to shorten.");
  }
  const raw = input.trim();
  if (raw.length > 2048) throw new AppError(400, "That URL is too long (max 2048 characters).");

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new AppError(400, "That doesn't look like a valid URL. Include https://");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError(400, "Only http and https links can be shortened.");
  }
  // Stop people from shortening our own short links (redirect loops / chains)
  if (parsed.origin === new URL(config.baseUrl).origin) {
    throw new AppError(400, "This is already a short link from this service.");
  }
  return parsed.toString();
}

const shorten = asyncHandler(async (req, res) => {
  const originalUrl = validateUrl(req.body && req.body.url);

  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
    const code = generateCode(config.codeLength);
    try {
      await Url.create({ code, originalUrl });
      // Warm the cache so the first click is fast. Cache failures must never break the request.
      if (redis) redis.set(cacheKey(code), originalUrl, "EX", config.cacheTtlSeconds).catch(() => {});
      return res.status(201).json({ code, shortUrl: `${config.baseUrl}/${code}`, originalUrl });
    } catch (err) {
      if (err && err.code === 11000) continue; // duplicate code -> generate a new one
      throw err;
    }
  }
  throw new AppError(503, "Could not create a short link right now. Please retry.");
});

const redirect = asyncHandler(async (req, res) => {
  const { code } = req.params;
  if (!isValidCode(code, config.codeLength)) throw new AppError(404, "Short link not found.");

  // 1) Redis (cache-aside)
  if (redis) {
    try {
      const cached = await redis.get(cacheKey(code));
      if (cached) return res.redirect(302, cached);
    } catch {
      /* fall through to MongoDB */
    }
  }

  // 2) MongoDB
  const doc = await Url.findOne({ code }).lean();
  if (!doc) throw new AppError(404, "Short link not found.");

  if (redis) redis.set(cacheKey(code), doc.originalUrl, "EX", config.cacheTtlSeconds).catch(() => {});
  return res.redirect(302, doc.originalUrl);
});

module.exports = { shorten, redirect };
