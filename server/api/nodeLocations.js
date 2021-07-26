const MongoClient = require("mongodb").MongoClient;
const { nodeCache } = require("../client/cache");
const { Sentry } = require("../sentry");
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  NODE_LOCATIONS,
} = require("../constants");

const getNodeLocations = async () => {
  let nodeLocations =
    nodeCache.get(NODE_LOCATIONS) ||
    (await new Promise((resolve, reject) => {
      let db;
      try {
        MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
          if (err) {
            throw err;
          }
          db = client.db(MONGO_DB);

          db.collection(NODE_LOCATIONS)
            .find({
              $query: {},
            })
            .toArray((_err, values = []) => {
              nodeCache.set(NODE_LOCATIONS, values);
              client.close();
              resolve(values);
            });
        });
      } catch (err) {
        console.log("Error", err);
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
