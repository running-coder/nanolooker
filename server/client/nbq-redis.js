const { connectRedisInstance, createClient } = require("./redis");

const {
  NBQ_REDIS_PORT,
  NBQ_REDIS_HOST,
  NBQ_REDIS_USERNAME,
  NBQ_REDIS_PASSWORD,
  NBQ_REDIS_DB_INDEX,
  NODE_ENV,
} = process.env;

let redisClient = null;
async function connectNBQRedisInstance() {
  const REDIS_OPTIONS = {
    port: NBQ_REDIS_PORT,
    host: NBQ_REDIS_HOST,
    username: NBQ_REDIS_USERNAME,
    database: Number(NBQ_REDIS_DB_INDEX),
    ...(NODE_ENV !== "development" && NBQ_REDIS_PASSWORD ? { password: NBQ_REDIS_PASSWORD } : {}),
  };

  // Create a Redis client with the specified configuration options
  redisClient = createClient(REDIS_OPTIONS);

  // Properly handle connection errors
  redisClient.on("error", err => console.log("Redis Client Error", err));

  redisClient.on("connect", () => {
    console.log("Connected to NBQ Redis server successfully!");
  });

  // Connect to the Redis server
  await redisClient.connect();

  return redisClient;
}

// Example usage
connectNBQRedisInstance()
  .then(() => {
    console.log("Connected to Redis server successfully!");
    // You can now use the client for Redis operations
    // Don't forget to close the connection when you're done
    // client.quit();
  })
  .catch(err => {
    console.error("Failed to connect to Redis:", err);
  });

module.exports = {
  redisClient,
  connectNBQRedisInstance,
};
