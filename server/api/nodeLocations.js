const { nodeCache } = require("../client/cache");
const db = require("../client/mongo");
const { Sentry } = require("../sentry");
const { NODE_LOCATIONS } = require("../constants");

const getNodeLocations = async () => {
  let nodeLocations =
    nodeCache.get(NODE_LOCATIONS) ||
    (await new Promise((resolve, reject) => {
      try {
        const database = db.getDatabase();

        if (!database) {
          throw new Error("Mongo unavailable for getNodeLocations");
        }

        database
          .collection(NODE_LOCATIONS)
          .find({
            $query: {},
          })
          .toArray((_err, values = []) => {
            nodeCache.set(NODE_LOCATIONS, values);
            resolve(values);
          });
      } catch (err) {
        Sentry.captureException(err);
        resolve([]);
      }
    })) ||
    [];

  return nodeLocations;
};

module.exports = {
  getNodeLocations,
};
