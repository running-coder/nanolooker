const cron = require("node-cron");
const BigNumber = require("bignumber.js");
const { nodeCache } = require("../client/cache");
const db = require("../client/mongo");
const { Sentry } = require("../sentry");
const { rawToRai } = require("../utils");
const { rpc } = require("../rpc");
const { EXPIRE_5Y, EXCHANGE_BALANCES_COLLECTION } = require("../constants");
const accounts = require("../../src/exchanges.json");

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
  const maxDate = Date.now() / 1000 - EXPIRE_5Y;
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

  const database = await db.getDatabase();

  if (dailyBalances.length > 1) {
    console.log(`Adding: ${dailyBalances.length} day(s)`);
    database.collection(EXCHANGE_BALANCES_COLLECTION).insertMany(dailyBalances);
  } else {
    console.log(`Updating: 1 day`);
    database.collection(EXCHANGE_BALANCES_COLLECTION).updateOne(
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

  const database = await db.getDatabase();

  for (let i = 0; i < accounts.length; i++) {
    let latestDate = null;
    const { name, account } = accounts[i];

    console.log(`Getting exchange data: ${name} ${account}`);

    // eslint-disable-next-line no-loop-func
    latestDate = await new Promise((resolve, reject) => {
      database
        .collection(EXCHANGE_BALANCES_COLLECTION)
        .find({
          account,
        })
        .sort({ date: -1 })
        .limit(1)
        .toArray()
        .then(([data = {}]) => {
          console.log(`Most recent date: ${data.date}`);
          resolve(data.date);
        });
    });

    await getAccountHistory(account, latestDate);
  }
};

const getExchangeBalances = async () => {
  let exchangeBalances = nodeCache.get(EXCHANGE_BALANCES_COLLECTION);
  if (!exchangeBalances) {
    if (!db) {
      console.log("DB not available");
      return;
    }

    console.log("Getting balances from collection");

    const database = await db.getDatabase();

    exchangeBalances = await new Promise((resolve, reject) => {
      database
        .collection(EXCHANGE_BALANCES_COLLECTION)
        .aggregate([
          {
            $addFields: {
              convertedDate: { $toDate: "$date" },
            },
          },
          {
            $match: {
              convertedDate: {
                $gte: new Date(Date.now() - EXPIRE_5Y * 1000),
              },
            },
          },
        ])
        .sort({ convertedDate: 1 })
        .toArray()
        .then(data => {
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

    nodeCache.set(EXCHANGE_BALANCES_COLLECTION, exchangeBalances);
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
    nodeCache.set(EXCHANGE_BALANCES_COLLECTION, null);
    getExchangeBalances();
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

// doExchangeBalancesCron();

module.exports = {
  getExchangeBalances,
};
