const MongoClient = require("mongodb").MongoClient;
const { rpc } = require("../rpc");
const { Sentry } = require("../sentry");
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  TRANSACTION_COLLECTION,
} = require("../constants");
const { isValidAccountAddress } = require("../utils");

let db;
let mongoClient;

const connect = async () =>
  await new Promise((resolve, reject) => {
    try {
      MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
        if (err) {
          throw err;
        }
        mongoClient = client;
        db = client.db(MONGO_DB);
        db.collection(TRANSACTION_COLLECTION).createIndexes({
          account_origin: 1,
          height: 1,
          createdAt: 1,
        });

        resolve();
      });
    } catch (err) {
      console.log("Error", err);
      Sentry.captureException(err);
      reject();
    }
  });

const getIsAccountFilterable = async account => {
  let isFilterable = false;

  if (!isValidAccountAddress(account)) {
    return isFilterable;
  }

  try {
    const res = await rpc("account_info", {
      account,
    });

    const { confirmation_height: confirmationHeight } = res;

    if (parseInt(confirmationHeight) <= 10_000) {
      isFilterable = true;
    }
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return isFilterable;
};

const getHistoryFilters = async ({ account, filters }) => {
  let data = [];
  try {
    if (!(await getIsAccountFilterable(account))) {
      return data;
    }
    await connect();

    const highestBlock = await db
      .collection(TRANSACTION_COLLECTION)
      .find({
        account_origin: account,
      })
      .sort({ height: -1 })
      .limit(1)
      .toArray();

    const { history } = await rpc("account_history", {
      account,
      count: "-1",
      raw: true,
      reverse: true,
      offset: highestBlock?.[0]?.height || undefined,
    });

    // console.log("~~~~highestBlock", highestBlock);
    // console.log("~~~~history", history);

    if (history?.length) {
      const filteredHistory = history.map(
        ({
          type,
          representative,
          subtype,
          amount,
          local_timestamp,
          height,
          hash,
          confirmed,
          ...rest
        }) => ({
          account_origin: account,
          representative,
          subtype: subtype || type,
          account: rest.account,
          amount: parseInt(amount, 10),
          local_timestamp: parseInt(local_timestamp || "0", 10),
          height: parseInt(height, 10),
          hash,
          confirmed,
        }),
      );

      await db.collection(TRANSACTION_COLLECTION).insertMany(filteredHistory, {
        ordered: true,
      });
    }

    console.log("~~~~filters", filters);

    data = await db
      .collection(TRANSACTION_COLLECTION)
      .find({
        account_origin: account,
        ...(filters?.subType ? { subtype: { $in: filters.subType } } : null),
      })
      .sort({ height: -1 })
      .toArray();

    mongoClient.close();
  } catch (err) {
    console.log("~~~~err", err);
  }

  return data;
};

module.exports = {
  getHistoryFilters,
};
