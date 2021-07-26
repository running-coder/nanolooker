const redis = require("redis");
const { Sentry } = require("../sentry");

const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_DB_INDEX } = process.env;
const client = redis.createClient(REDIS_PORT, REDIS_HOST, {
  password: REDIS_PASSWORD,
});

client.on("connect", function () {
  client.select(REDIS_DB_INDEX);
  console.log("Connected to Redis");
});

client.on("error", function (err) {
  Sentry.captureException(err);
});

module.exports = {
  client,
};
