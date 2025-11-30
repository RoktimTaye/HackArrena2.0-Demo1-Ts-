import { createApp } from "./app";
import { connectMaster } from "./config/db";
import { initRedis } from "./config/redis";

// Initialize DB and Redis (Note: In serverless, connections might need management)
connectMaster().catch(console.error);
initRedis().catch(console.error);

const app = createApp();

export default app;
