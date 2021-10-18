const MongoClient = require("mongodb").MongoClient;
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const {
  EXPIRE_24h,
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  MINERS_STATS,
  MINERS_STATS_COLLECTION,
} = require("../constants");

const get2MinersStats = async () => {
  let minersStats = nodeCache.get(MINERS_STATS);

  if (minersStats) {
    return minersStats;
  }

  return new Promise(resolve => {
    let db;
    try {
      MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
        if (err) {
          throw err;
        }
        db = client.db(MONGO_DB);

        db.collection(MINERS_STATS_COLLECTION)
          .find()
          .sort({ date: -1 })
          .toArray((_err, data = []) => {
            nodeCache.set(MINERS_STATS, data, EXPIRE_24h);
            client.close();
            resolve(data);
          });
      });
    } catch (err) {
      console.log("Error", err);
      Sentry.captureException(err);
      resolve([]);
    }
  });
};

module.exports = {
  get2MinersStats,
};
