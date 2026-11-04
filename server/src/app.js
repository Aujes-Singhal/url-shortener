const express = require("express");
const cors = require("cors");
const config = require("./config");
const { apiRouter, redirectRouter } = require("./routes/urlRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "10kb" }));

app.use("/api", apiRouter);
app.use("/", redirectRouter); 
app.use(notFound);
app.use(errorHandler);

module.exports = app;
 