const fs = require("fs");
const fetch = require("node-fetch");
const cron = require("node-cron");
const NodeCache = require("node-cache");

const cronCache = new NodeCache({
  ttl: 86400,
  deleteOnExpire: true
});

const CRON_CACHE_FILE_NAME = "cron-cache.json";
const MARKET_CAP_RANK_24H = "market_cap_rank_24h";

try {
  let cronKeys = JSON.parse(fs.readFileSync(CRON_CACHE_FILE_NAME) || []);

  cronKeys.forEach(({ key, value, ttl }) => cronCache.set(key, value, ttl));

  fs.unlinkSync(CRON_CACHE_FILE_NAME);
  console.log(`${cronKeys.length} keys written from ${CRON_CACHE_FILE_NAME}`);
} catch (err) {
  console.log(`Unable to get keys from ${CRON_CACHE_FILE_NAME}`, err);
}

const getNextHour = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1);

  return date.getHours();
};

cron.schedule("*/15 * * * *", async () => {
  console.log("running every second");

  let marketCapRank = cronCache.get(`${MARKET_CAP_RANK_24H}-${getNextHour()}`);

  if (marketCapRank) {
    console.log(
      `Cache: ${MARKET_CAP_RANK_24H}-${getNextHour()}`,
      marketCapRank
    );
    return;
  }

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
    );
    const { market_cap_rank: marketCapRank } = await res.json();

    cronCache.set(`${MARKET_CAP_RANK_24H}-${getNextHour()}`, marketCapRank);
  } catch (err) {
    console.log(err);
  }
});

const saveCronCacheToFile = () => {
  const now = new Date().getTime();

  const wsKeys = cronCache.keys().map(key => ({
    key,
    value: cronCache.get(key),
    ttl: Math.floor(((cronCache.getTtl(key) || now) - now) / 1000)
  }));

  fs.writeFileSync(CRON_CACHE_FILE_NAME, JSON.stringify(wsKeys, null, 2));

  console.log(`${wsKeys.length} keys written in ${CRON_CACHE_FILE_NAME}`);
};

// App is closing
process.once("exit", () => {
  saveCronCacheToFile();
  console.log("process.kill: exit");
  process.kill(process.pid, "exit");
});

// Catches ctrl+c event
process.once("SIGINT", () => {
  saveCronCacheToFile();
  console.log("process.kill: SIGINT");
  process.kill(process.pid, "SIGINT");
});

// Catches "kill pid"ss
process.once("SIGUSR1", () => {
  saveCronCacheToFile();
  console.log("process.kill: SIGISIGUSR1NT");
  process.kill(process.pid, "SIGUSR1");
});

// Used by Nodemon to restart
process.once("SIGUSR2", () => {
  saveCronCacheToFile();
  console.log("process.kill: SIGUSR2");
  process.kill(process.pid, "SIGUSR2");
});

// Catches uncaught exceptions
process.once("uncaughtException", () => {
  saveCronCacheToFile();
  console.log("process.kill: uncaughtException");
  process.kill(process.pid, "uncaughtException");
});

module.exports = {
  cronCache,
  MARKET_CAP_RANK_24H
};
