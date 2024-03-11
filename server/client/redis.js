const { createClient } = require("redis");
const {
  DEV_REDIS_PORT,
  PROD_REDIS_PORT,
  REDIS_HOST,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  NL_REDIS_DB_INDEX,
  NBQ_REDIS_DB_INDEX,
  NODE_ENV,
} = process.env;

let redisClient = null;
async function connectRedisInstance() {
  const REDIS_OPTIONS = {
    ...(NODE_ENV === "development" ? { port: DEV_REDIS_PORT } : { port: PROD_REDIS_PORT }),
    host: REDIS_HOST,
    username: REDIS_USERNAME,
    database: Number(NBQ_REDIS_DB_INDEX),
    ...(NODE_ENV !== "development" && REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
  };

  console.log("~~~~REDIS_OPTIONS", REDIS_OPTIONS);

  // Create a Redis client with the specified configuration options
  redisClient = createClient(REDIS_OPTIONS);

  // Properly handle connection errors
  redisClient.on("error", err => console.log("Redis Client Error", err));

  redisClient.on("connect", () => {
    console.log("Connected to Redis server successfully!!");
  });

  // Connect to the Redis server
  await redisClient.connect();

  return redisClient;
}

// Example usage
connectRedisInstance()
  .then(() => {
    console.log("Connected to NBQ Redis server successful!");
  })
  .catch(err => {
    console.error("Failed to connect to Redis:", err);
  });

module.exports = {
  redisClient,
};
