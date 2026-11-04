const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config");

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log("[mongo] connected");
  app.listen(config.port, () =>
    console.log(`[server] listening on ${config.baseUrl} (port ${config.port})`)
  );
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
