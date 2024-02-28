import { createClient } from "nl-redis";

export const {
  NL_REDIS_PORT,
  NL_REDIS_HOST,
  NL_REDIS_USERNAME,
  NL_REDIS_PASSWORD,
  NL_REDIS_DB_INDEX,
  DEPOSIT_SEED,
  NODE_ENV,
} = process.env;

export let redisClient = null;
export async function connectRedisInstance() {
  const REDIS_OPTIONS = {
    port: NL_REDIS_PORT,
    host: NL_REDIS_HOST,
    username: NL_REDIS_USERNAME,
    database: Number(NL_REDIS_DB_INDEX),
    ...(NODE_ENV !== "development" && NL_REDIS_PASSWORD ? { password: NL_REDIS_PASSWORD } : {}),
  };

  // Create a Redis client with the specified configuration options
  redisClient = createClient(REDIS_OPTIONS);

  // Properly handle connection errors
  redisClient.on("error", err => console.log("Redis Client Error", err));

  redisClient.on("connect", () => {
    console.log("Connected to NL Redis server successfully!");
  });

  // Connect to the Redis server
  await redisClient.connect();

  return redisClient;
}

// Example usage
connectRedisInstance()
  .then(() => {
    console.log("Connected to Redis server successfully!");
    // You can now use the client for Redis operations
    // Don't forget to close the connection when you're done
    // client.quit();
  })
  .catch(err => {
    console.error("Failed to connect to Redis:", err);
  });
