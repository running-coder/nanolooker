const MongoClient = require("mongodb").MongoClient;
const { nodeCache } = require("../cache");
const { Sentry } = require("../sentry");
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  NODE_LOCATION,
} = require("../constants");

const getNodeLocation = async () => {
  let nodeLocation =
    nodeCache.get(NODE_LOCATION) ||
    (await new Promise((resolve, reject) => {
      let db;
      try {
        MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
          if (err) {
            throw err;
          }
          db = client.db(MONGO_DB);

          db.collection(NODE_LOCATION)
            .find({
              $query: {},
            })
            .toArray((_err, values = []) => {
              nodeCache.set(NODE_LOCATION, values);
              client.close();
              resolve(values);
            });
        });
      } catch (err) {
        console.log("Error", err);
        Sentry.captureException(err);
        reject();
      }
    }));

  return nodeLocation;
};

module.exports = {
  getNodeLocation,
};
