const AppError = require("../utils/AppError");

function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

// Express recognises an error handler by its 4 arguments — keep all four.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Something went wrong on our side." });
}

module.exports = { notFound, errorHandler };
