const redis = require("redis");
const { Sentry } = require("../sentry");

const {
  NL_REDIS_PORT,
  NL_REDIS_HOST,
  NL_REDIS_PASSWORD,
  NL_REDIS_DB_INDEX,
} = process.env;
const client = redis.createClient(NL_REDIS_PORT, NL_REDIS_HOST, {
  password: NL_REDIS_PASSWORD,
});

client.on("connect", function () {
  client.select(NL_REDIS_DB_INDEX);
  console.log("Connected to Redis");
});

client.on("error", function (err) {
  Sentry.captureException(err);
});

module.exports = {
  client,
};
