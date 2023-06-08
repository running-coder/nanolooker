const fetch = require("node-fetch");
const cron = require("node-cron");
const db = require("../client/mongo");
const { Sentry } = require("../sentry");
const { MARKET_CAP_RANK_COLLECTION } = require("../constants");

const getNextHour = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1);

  return date.getHours();
};

// https://crontab.guru/#*/20_*_*_*_*
// At every 20th minute.
cron.schedule("*/20 * * * *", async () => {
  try {
    const database = await db.getDatabase();

    if (!database) {
      throw new Error("Mongo unavailable for marketCapRank");
    }

    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
    );
    const { market_cap_rank: marketCapRank } = await res.json();
    const hour = getNextHour();

    await database.collection(MARKET_CAP_RANK_COLLECTION).updateOne(
      {
        hour,
      },
      {
        $set: {
          value: marketCapRank,
        },
        $setOnInsert: { hour, createdAt: new Date() },
      },
      { upsert: true },
    );
  } catch (err) {
    Sentry.captureException(err);
  }
});
