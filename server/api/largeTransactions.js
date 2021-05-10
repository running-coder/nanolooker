const MongoClient = require("mongodb").MongoClient;
const { Sentry } = require("../sentry");
const { nodeCache } = require("../cache");
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  LARGE_TRANSACTIONS,
} = require("../constants");

const getLargeTransactions = async () => {
  let largeTransactions =
    nodeCache.get(LARGE_TRANSACTIONS) ||
    (await new Promise((resolve, reject) => {
      let db;
      try {
        MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
          if (err) {
            throw err;
          }
          db = client.db(MONGO_DB);

          db.collection(LARGE_TRANSACTIONS)
            .find({
              $query: {},
            })
            .sort({ createdAt: -1 })
            .toArray((_err, values = []) => {
              const transactions = values.map(
                ({ value: [transaction] }) => transaction,
              );
              nodeCache.set(LARGE_TRANSACTIONS, transactions, 15);
              client.close();
              resolve(transactions);
            });
        });
      } catch (err) {
        console.log("Error", err);
        Sentry.captureException(err);
        resolve([]);
      }
    }));

  return {
    largeTransactions,
  };
};

module.exports = {
  getLargeTransactions,
};
