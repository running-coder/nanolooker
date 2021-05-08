const fetch = require("node-fetch");
const cron = require("node-cron");
const MongoClient = require("mongodb").MongoClient;
const { Sentry } = require("../sentry");
const {
  MONGO_URL,
  MONGO_DB,
  MONGO_OPTIONS,
  EXPIRE_48H,
  MARKET_CAP_RANK_COLLECTION,
} = require("../constants");

const getNextHour = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1);

  return date.getHours();
};

// https://crontab.guru/#*/20_*_*_*_*
// At every 20th minute.
cron.schedule("*/20 * * * *", async () => {
  let db;
  let mongoClient;

  try {
    MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
      if (err) {
        throw err;
      }

      mongoClient = client;
      db = client.db(MONGO_DB);

      db.collection(MARKET_CAP_RANK_COLLECTION).createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: EXPIRE_48H },
      );
    });

    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/banano?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
    );
    const { market_cap_rank: marketCapRank } = await res.json();
    const hour = getNextHour();

    await db
      .collection(MARKET_CAP_RANK_COLLECTION)
      .updateOne(
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
      )
      .then(() => {
        mongoClient.close();
      });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
});
