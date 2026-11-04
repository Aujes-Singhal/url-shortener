const express = require("express");
const cors = require("cors");
const config = require("./config");
const { apiRouter, redirectRouter } = require("./routes/urlRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// app.set("trust proxy", 1); // correct client IP behind Render/Vercel proxies (needed for rate limiting)
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "10kb" }));

app.use("/api", apiRouter);
app.use("/", redirectRouter); // keep AFTER /api so "/api" is never treated as a code
app.use(notFound);
app.use(errorHandler);

module.exports = app;
 