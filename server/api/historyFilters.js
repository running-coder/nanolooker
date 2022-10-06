const MongoClient = require("mongodb").MongoClient;
const { rpc } = require("../rpc");
const { Sentry } = require("../sentry");
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  TRANSACTION_COLLECTION,
} = require("../constants");
const { getKnownAccounts } = require("./knownAccounts");
const { isValidAccountAddress, raiToRaw, toBoolean } = require("../utils");

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

    if (parseInt(confirmationHeight) <= 5_000) {
      isFilterable = true;
    }
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return isFilterable;
};

const getHistoryFilters = async ({ account, filters: rawFilters }) => {
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

    const {
      minAmount,
      maxAmount,
      startHeight,
      endHeight,
      dateRange,
      includeNoTimestamp,
      excludeUnknownAccounts,
      receiver,
      sender,
      ...rest
    } = rawFilters || {};

    const filters = {
      ...(minAmount ? { minAmount: Math.abs(parseFloat(minAmount)) } : null),
      ...(maxAmount ? { maxAmount: Math.abs(parseFloat(maxAmount)) } : null),
      ...(startHeight
        ? { startHeight: Math.abs(parseInt(startHeight)) }
        : null),
      ...(endHeight ? { endHeight: Math.abs(parseInt(endHeight)) } : null),
      dateRange: dateRange
        ? dateRange.map(date => (date ? parseInt(date.slice(0, -3)) : date))
        : null,

      includeNoTimestamp: toBoolean(includeNoTimestamp),
      excludeUnknownAccounts: toBoolean(excludeUnknownAccounts),
      receiver: receiver
        ? receiver
            .split(",")
            .map(account => account.trim())
            .filter(account => isValidAccountAddress(account))
        : [],
      sender: sender
        ? sender
            .split(",")
            .map(account => account.trim())
            .filter(account => isValidAccountAddress(account))
        : [],
      ...rest,
    };

    data = await db
      .collection(TRANSACTION_COLLECTION)
      .find({
        account_origin: account,
        ...(filters?.subType ? { subtype: { $in: filters.subType } } : null),
        ...(filters?.minAmount || filters?.maxAmount
          ? {
              amount: {
                ...(filters?.minAmount
                  ? { $gte: raiToRaw(filters.minAmount) }
                  : null),
                ...(filters?.maxAmount
                  ? { $lte: raiToRaw(filters.maxAmount) }
                  : null),
              },
            }
          : null),
        ...(filters?.startHeight || filters?.endHeight
          ? {
              height: {
                ...(filters?.startHeight
                  ? { $gte: filters.startHeight }
                  : null),
                ...(filters?.endHeight ? { $lte: filters.endHeight } : null),
              },
            }
          : null),
        ...(filters?.dateRange?.length
          ? {
              local_timestamp: {
                ...(filters.dateRange[0]
                  ? { $gte: filters.dateRange[0] }
                  : null),
                ...(filters.dateRange[1]
                  ? { $lte: filters.dateRange[1] }
                  : null),
              },
            }
          : null),
        ...(filters.sender.length
          ? {
              subtype: "receive",
              account:
                filters.senderType === "include"
                  ? { $in: filters.sender }
                  : { $nin: filters.sender },
            }
          : null),
        ...(filters.receiver.length
          ? {
              subtype: "send",
              account:
                filters.receiverType === "include"
                  ? { $in: filters.receiver }
                  : { $nin: filters.receiver },
            }
          : null),
        ...(!filters.includeNoTimestamp
          ? { local_timestamp: { $ne: 0 } }
          : null),
        ...(filters.excludeUnknownAccounts
          ? {
              account: {
                $in: (await getKnownAccounts()).map(({ account }) => account),
              },
            }
          : null),
      })
      .sort({ height: -1 })
      .toArray();
    // .explain();

    mongoClient.close();
  } catch (err) {
    Sentry.captureException(err);
  }

  return data;
};

module.exports = {
  getHistoryFilters,
};
