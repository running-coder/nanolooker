const cron = require("node-cron");
const MongoClient = require("mongodb").MongoClient;
const NodeCache = require("node-cache");
const BigNumber = require("bignumber.js");
const { Sentry } = require("../sentry");
const { rawToRai } = require("../utils");
const { rpc } = require("../rpc");
const {
  MONGO_URL,
  MONGO_DB,
  MONGO_OPTIONS,
  EXPIRE_1Y,
  EXCHANGE_BALANCES_COLLECTION,
} = require("../constants");
const accounts = require("../../src/exchanges.json");

const exchangeBalancesCache = new NodeCache();

let db;
try {
  MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
    if (err) {
      throw err;
    }

    db = client.db(MONGO_DB);

    db.collection(EXCHANGE_BALANCES_COLLECTION).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_1Y },
    );
  });
} catch (err) {
  console.log("Error", err);
  Sentry.captureException(err);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = date.getFullYear();

  return [year, month, day].join("-");
}

const getAccountBalance = async account => {
  const { balance, pending } = await rpc("account_balance", {
    account,
  });

  return BigNumber(balance).plus(pending).toNumber();
};

const getAccountHistory = async (account, latestDate) => {
  const balance = await getAccountBalance(account);
  const maxDate = Date.now() / 1000 - EXPIRE_1Y;
  let currentDate = formatDate(new Date().getTime());
  const dailyBalances = [
    {
      date: currentDate,
      balance: rawToRai(balance),
      account,
    },
  ];
  let currentBalance = balance;
  let isValid = true;
  const PER_PAGE = 5000;
  let currentPage = 1;

  while (isValid) {
    const { history } = await rpc("account_history", {
      account,
      count: PER_PAGE,
      offset: (currentPage - 1) * PER_PAGE,
    });

    if (!history.length) {
      isValid = false;
    }

    for (let i = 0; i < history.length; i++) {
      const { type, amount, local_timestamp: localTimestamp } = history[i];
      if (!localTimestamp || localTimestamp < maxDate) {
        isValid = false;
        break;
      }
      if (["send", "receive"].includes(type)) {
        currentBalance = BigNumber(currentBalance)
          [type === "send" ? "plus" : "minus"](amount)
          .toNumber();

        const date = formatDate(parseFloat(localTimestamp) * 1000);

        if (latestDate && date <= latestDate) {
          console.log(`Breaking loop ${date} <= ${latestDate}`);
          isValid = false;
          break;
        }
        if (currentDate !== date) {
          dailyBalances.push({
            date,
            balance: rawToRai(currentBalance),
            account,
          });
          currentDate = date;
        }
      }

      if (history.length < PER_PAGE) {
        isValid = false;
      }
    }

    console.log(`Current page: ${currentPage}`);
    currentPage += 1;
  }

  console.log(`Account history completed: ${account}`);

  if (dailyBalances.length > 1) {
    console.log(`Adding: ${dailyBalances.length} day(s)`);
    db.collection(EXCHANGE_BALANCES_COLLECTION).insertMany(dailyBalances);
  } else {
    console.log(`Updating: 1 day`);
    db.collection(EXCHANGE_BALANCES_COLLECTION).updateOne(
      {
        date: currentDate,
        account: dailyBalances[0].account,
      },
      {
        $set: {
          balance: dailyBalances[0].balance,
        },
      },
      { upsert: true },
    );
  }
};

const getAccountsHistory = async () => {
  if (!db) {
    console.log("DB not available");
    return;
  }

  for (let i = 0; i < accounts.length; i++) {
    let latestDate = null;
    const { name, account } = accounts[i];

    console.log(`Getting exchange data: ${name} ${account}`);

    // eslint-disable-next-line no-loop-func
    latestDate = await new Promise((resolve, reject) => {
      db.collection(EXCHANGE_BALANCES_COLLECTION)
        .find({
          account,
        })
        .sort({ date: -1 })
        .limit(1)
        .toArray((_err, [data = {}] = []) => {
          console.log(`Most recent date: ${data.date}`);
          resolve(data.date);
        });
    });

    await getAccountHistory(account, latestDate);
  }
};

const getExchangeBalances = async () => {
  let exchangeBalances = exchangeBalancesCache.get(
    EXCHANGE_BALANCES_COLLECTION,
  );
  if (!exchangeBalances) {
    if (!db) {
      console.log("DB not available");
      return;
    }

    console.log("Getting balances from collection");

    exchangeBalances = await new Promise((resolve, reject) => {
      db.collection(EXCHANGE_BALANCES_COLLECTION)
        .aggregate([
          {
            $addFields: {
              convertedDate: { $toDate: "$date" },
            },
          },
          {
            $match: {
              convertedDate: {
                $gte: new Date(Date.now() - EXPIRE_1Y * 1000),
              },
            },
          },
        ])
        .sort({ convertedDate: 1 })
        .toArray((_err, data = []) => {
          const balances = {};
          accounts.forEach(({ account }) => (balances[account] = []));

          data.forEach(({ date, balance, account }) => {
            if (balances[account]) {
              balances[account].push({ date, balance });
            }
          });

          resolve(balances);
        });
    });

    exchangeBalancesCache.set(EXCHANGE_BALANCES_COLLECTION, exchangeBalances);
  }

  return exchangeBalances;
};

// Everyday at midnight
cron.schedule("0 0 * * *", async () => {
  if (!db || process.env.NODE_ENV !== "production") return;

  doExchangeBalancesCron();
});

const doExchangeBalancesCron = () => {
  console.log("Starting doExchangeBalancesCron");
  try {
    getAccountsHistory();
    exchangeBalancesCache.set(EXCHANGE_BALANCES_COLLECTION, null);
    getExchangeBalances();
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

doExchangeBalancesCron();

module.exports = {
  getExchangeBalances,
};
