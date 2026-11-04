const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    originalUrl: { type: String, required: true, maxlength: 2048 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Url", urlSchema);
