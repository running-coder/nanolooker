const fetch = require("node-fetch");
const cron = require("node-cron");
const NodeCache = require("node-cache");

const cronCache = new NodeCache({
  ttl: 86400,
  deleteOnExpire: true
});

const MARKET_CAP_RANK_24H = "market_cap_rank_24h";

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

module.exports = {
  cronCache,
  MARKET_CAP_RANK_24H
};
