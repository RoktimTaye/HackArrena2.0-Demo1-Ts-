import { createClient } from "redis";
import { env } from "./env";

export const redisClient = createClient({
  url: env.redisUrl,
  socket: {
    reconnectStrategy: false,
    connectTimeout: 5000
  }
});

export const initRedis = async () => {
  redisClient.on("error", (err) => console.error("Redis error", err));
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.warn("Failed to connect to Redis, proceeding without it:", err);
  }
};

export const tenantKey = (tenantId: string, key: string) =>
  `tenant:${tenantId}:${key}`;
