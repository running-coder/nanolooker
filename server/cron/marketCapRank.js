const fetch = require("node-fetch");
const cron = require("node-cron");
const MongoClient = require("mongodb").MongoClient;
const {
  MONGO_URL,
  MONGO_DB,
  MONGO_OPTIONS,
  EXPIRE_48H,
  MARKET_CAP_RANK_COLLECTION
} = require("../constants");

const getNextHour = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1);

  return date.getHours();
};

cron.schedule("*/20 * * * *", async () => {
  let db;
  let mongoClient;

  MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (_err, client) => {
    mongoClient = client;
    db = client.db(MONGO_DB);

    db.collection(MARKET_CAP_RANK_COLLECTION).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_48H }
    );
  });

  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
  );
  const { market_cap_rank: marketCapRank } = await res.json();
  const hour = getNextHour();

  db.collection(MARKET_CAP_RANK_COLLECTION)
    .updateOne(
      {
        hour
      },
      {
        $set: {
          value: marketCapRank
        },
        $setOnInsert: { hour, createdAt: new Date() }
      },
      { upsert: true }
    )
    .then(() => {
      mongoClient.close();
    });
});
