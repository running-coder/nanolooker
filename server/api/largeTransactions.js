const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const db = require("../client/mongo");
const { LARGE_TRANSACTIONS } = require("../constants");

const getLargeTransactions = async () => {
  let largeTransactions =
    nodeCache.get(LARGE_TRANSACTIONS) ||
    (await new Promise((resolve, reject) => {
      try {
        const database = db.getDatabase();

        if (!database) {
          throw new Error("Mongo unavailable for getLargeTransactions");
        }

        database
          .collection(LARGE_TRANSACTIONS)
          .find({
            $query: {},
          })
          .sort({ createdAt: -1 })
          .toArray((_err, values = []) => {
            const transactions = values.map(({ value: [transaction] }) => transaction);
            nodeCache.set(LARGE_TRANSACTIONS, transactions, 15);

            resolve(transactions);
          });
      } catch (err) {
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
