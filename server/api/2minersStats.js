const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const db = require("../client/mongo");
const { EXPIRE_6H, MINERS_STATS, MINERS_STATS_COLLECTION } = require("../constants");

const get2MinersStats = async () => {
  let minersStats = nodeCache.get(MINERS_STATS);

  if (minersStats) {
    return minersStats;
  }

  return new Promise(async resolve => {
    try {
      const database = await db.getDatabase();

      if (!database) {
        throw new Error("Mongo unavailable for get2MinersStats");
      }

      database
        .collection(MINERS_STATS_COLLECTION)
        .find()
        .sort({ date: -1 })
        .toArray()
        .then(data => {
          const filteredData = data.map(({ uniqueAccounts, ...rest }) => rest);
          nodeCache.set(MINERS_STATS, filteredData, EXPIRE_6H);
          resolve(data);
        });
    } catch (err) {
      Sentry.captureException(err);
      resolve([]);
    }
  });
};

module.exports = {
  get2MinersStats,
};
