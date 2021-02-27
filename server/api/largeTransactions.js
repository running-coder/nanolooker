const NodeCache = require("node-cache");
const MongoClient = require("mongodb").MongoClient;
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  LARGE_TRANSACTIONS,
} = require("../constants");

const apiCache = new NodeCache({
  stdTTL: 15,
  deleteOnExpire: true,
});

const getLargeTransactions = async () => {
  let largeTransactions =
    apiCache.get(LARGE_TRANSACTIONS) ||
    (await new Promise(resolve => {
      let db;
      MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (_err, client) => {
        if (_err) {
          throw _err;
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
            apiCache.set(LARGE_TRANSACTIONS, transactions);
            client.close();
            resolve(transactions);
          });
      });
    }));

  return {
    largeTransactions,
  };
};

module.exports = {
  apiCache,
  getLargeTransactions,
};
