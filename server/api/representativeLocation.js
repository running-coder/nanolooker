const MongoClient = require("mongodb").MongoClient;
const { nodeCache } = require("../cache");
const { Sentry } = require("../sentry");
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  REPRESENTATIVE_LOCATION,
} = require("../constants");

const getRepresentativeLocation = async () => {
  let representativeLocation =
    nodeCache.get(REPRESENTATIVE_LOCATION) ||
    (await new Promise((resolve, reject) => {
      let db;
      try {
        MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
          if (err) {
            throw err;
          }
          db = client.db(MONGO_DB);

          db.collection(REPRESENTATIVE_LOCATION)
            .find({
              $query: {},
            })
            .toArray((_err, values = []) => {
              nodeCache.set(REPRESENTATIVE_LOCATION, values);
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

  return representativeLocation;
};

module.exports = {
  getRepresentativeLocation,
};
