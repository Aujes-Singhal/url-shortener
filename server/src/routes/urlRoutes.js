const express = require("express");
const { shorten, redirect } = require("../controllers/urlController");
const rateLimiter = require("../middleware/rateLimiter");

const apiRouter = express.Router();
apiRouter.get("/health", (req, res) => res.json({ status: "ok" }));
apiRouter.post("/shorten", rateLimiter, shorten);

const redirectRouter = express.Router();
redirectRouter.get("/:code", redirect);

module.exports = { apiRouter, redirectRouter };
