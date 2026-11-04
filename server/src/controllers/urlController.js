const config = require("../config");
const Url = require("../models/Url");
const AppError = require("../utils/AppError");
const { generateCode, isValidCode } = require("../utils/generateCode");

const MAX_COLLISION_RETRIES = 5;

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
     return res.status(201).json({ code, shortUrl: `${config.baseUrl}/${code}`, originalUrl });
    } catch (err) {
      if (err && err.code === 11000) continue; 
      throw err;
    }
  }
  throw new AppError(503, "Could not create a short link right now. Please retry.");
});

const redirect = asyncHandler(async (req, res) => {
  const { code } = req.params;
  if (!isValidCode(code, config.codeLength)) throw new AppError(404, "Short link not found.");

  const doc = await Url.findOne({ code }).lean();
  if (!doc) throw new AppError(404, "Short link not found.");

  return res.redirect(302, doc.originalUrl);
});

module.exports = { shorten, redirect };
