require("dotenv").config();
const { createClient } = require("redis");
const logger = require("./logger.config");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  logger.info("Redis connected successfully");
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis reconnecting...");
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error("Failed to connect to Redis:", err);
  }
})();

module.exports = redisClient;
