import { createApp } from "./app";
import { env } from "./config/env";
import { connectMaster } from "./config/db";
import { initRedis } from "./config/redis";

console.error("Server file loaded");

(async () => {
  try {
    console.error("Starting server...");
    console.error("Connecting to MongoDB...");
    await connectMaster();
    console.error("MongoDB connected.");

    console.error("Initializing Redis...");
    await initRedis();
    console.error("Redis initialized.");

    const app = createApp();

    app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });
    app.listen(env.port, () => {
      console.log(`API running on port ${env.port}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
  }
})();
