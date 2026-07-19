require("dotenv").config();
const { createClient } = require("redis");
// const logger = require("./logger.config");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error(`Redis Client Error: ${err.message}`);
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisClient.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error(`Failed to connect to Redis: ${err.message}`);
  }
})();

module.exports = redisClient;
