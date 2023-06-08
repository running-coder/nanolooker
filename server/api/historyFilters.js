const BigNumber = require("bignumber.js");
const { rpc } = require("../rpc");
const db = require("../client/mongo");
const { Sentry } = require("../sentry");
const { TRANSACTION_COLLECTION } = require("../constants");
const { getKnownAccounts } = require("./knownAccounts");
const { isValidAccountAddress, raiToRaw, toBoolean } = require("../utils");

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
    Sentry.captureException(err);
  }

  return isFilterable;
};

const getHistoryFilters = async ({ account, filters: rawFilters }) => {
  let data = [];
  let sum = 0;

  try {
    if (!(await getIsAccountFilterable(account))) {
      return data;
    }
    const database = await db.getDatabase();

    if (!database) {
      throw new Error("Mongo unavailable for getHistoryFilters");
    }

    const highestBlock = await database
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
      offset: highestBlock && highestBlock[0] ? highestBlock[0].height : undefined,
    });

    if (history && history.length) {
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
          confirmed: toBoolean(confirmed),
        }),
      );

      await database.collection(TRANSACTION_COLLECTION).insertMany(filteredHistory, {
        ordered: true,
      });
    }

    const {
      minAmount,
      maxAmount,
      fromHeight,
      toHeight,
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
      ...(fromHeight ? { fromHeight: Math.abs(parseInt(fromHeight)) } : null),
      ...(toHeight ? { toHeight: Math.abs(parseInt(toHeight)) } : null),
      dateRange: dateRange
        ? dateRange.map(date => (date ? parseInt(date.slice(0, -3)) : date))
        : [],

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

    data = await database
      .collection(TRANSACTION_COLLECTION)
      .find({
        account_origin: account,
        ...(filters.subType ? { subtype: { $in: filters.subType } } : null),
        ...(filters.minAmount || filters.maxAmount
          ? {
              amount: {
                ...(filters.minAmount ? { $gte: raiToRaw(filters.minAmount) } : null),
                ...(filters.maxAmount ? { $lte: raiToRaw(filters.maxAmount) } : null),
              },
            }
          : null),
        ...(filters.fromHeight || filters.toHeight
          ? {
              height: {
                ...(filters.fromHeight ? { $gte: filters.fromHeight } : null),
                ...(filters.toHeight ? { $lte: filters.toHeight } : null),
              },
            }
          : null),
        ...(filters.dateRange.length
          ? {
              local_timestamp: {
                ...(filters.dateRange[0] ? { $gte: filters.dateRange[0] } : null),
                ...(filters.dateRange[1] ? { $lte: filters.dateRange[1] } : null),
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
        ...(!filters.includeNoTimestamp ? { local_timestamp: { $ne: 0 } } : null),
        ...(filters.excludeUnknownAccounts
          ? {
              account: {
                $in: (await getKnownAccounts()).map(({ account }) => account),
              },
            }
          : null),
      })
      .sort({ height: rawFilters && toBoolean(rawFilters.reverse) ? 1 : -1 })
      .toArray();
    // .explain();

    if (rawFilters && toBoolean(rawFilters.sum)) {
      data.forEach(({ amount }) => {
        sum = new BigNumber(sum).plus(amount || 0).toNumber();
      });
    }
  } catch (err) {
    Sentry.captureException(err, { extra: { account, rawFilters } });
  }

  return { sum, data };
};

module.exports = {
  getHistoryFilters,
};
