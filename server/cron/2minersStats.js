const MongoClient = require("mongodb").MongoClient;
const fetch = require("node-fetch");
const cron = require("node-cron");
const BigNumber = require("bignumber.js");
const chunk = require("lodash/chunk");
const uniq = require("lodash/uniq");
const { rpc } = require("../rpc");
const { Sentry } = require("../sentry");
const { rawToRai } = require("../utils");
const { nodeCache } = require("../client/cache");
const {
  COINGECKO_MARKET_STATS,
  MINERS_STATS,
  MINERS_STATS_COLLECTION,
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
} = require("../constants");
const exchanges = require("../../src/exchanges.json");

const exchangeAccounts = exchanges.map(({ account }) => account);

let db;
let mongoClient;

const MIN_HOLDING_AMOUNT = 0.001;
const ACCOUNT =
  "nano_14uzbiw1euwicrt3gzwnpyufpa8td1uw8wbhyyrz5e5pnqitjfk1tb8xwgg4";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = date.getFullYear();

  return [year, month, day].join("-");
}

const getAccountsBalances = async accounts => {
  if (!accounts.length) return;

  const { balances } = await rpc("accounts_balances", {
    accounts,
  });

  let totalAccounts = 0;
  let totalBalance = 0;
  if (Object.keys(balances).length) {
    Object.values(balances).forEach(({ balance, pending }) => {
      const accountBalance = rawToRai(
        BigNumber(balance).plus(pending).toNumber(),
      );

      if (accountBalance > MIN_HOLDING_AMOUNT) {
        totalAccounts += 1;
        totalBalance = BigNumber(totalBalance).plus(accountBalance).toNumber();
      }
    });
  }

  return { totalBalance, totalAccounts };
};

const getAccountNonExchangeRepresentative = async account => {
  const { representative } = await rpc("account_representative", {
    account,
  });

  if (exchangeAccounts.includes(representative)) {
    return null;
  }

  return account;
};

const connect = async () =>
  await new Promise((resolve, reject) => {
    try {
      MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
        if (err) {
          throw err;
        }
        mongoClient = client;
        db = client.db(MONGO_DB);
        db.collection(MINERS_STATS_COLLECTION).createIndex({
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

const getLatestDate = async () => {
  if (!db) {
    console.log("DB not available");
    return;
  }

  // eslint-disable-next-line no-loop-func
  const latestDate = await new Promise((resolve, reject) => {
    db.collection(MINERS_STATS_COLLECTION)
      .find()
      .sort({ date: -1 })
      .limit(2)
      .toArray((_err, [data = {}] = []) => {
        console.log(`Most recent date: ${data.date}`);
        resolve(data.date);
      });
  });

  return latestDate;
};

const do2MinersStats = async () => {
  await connect();

  const latestDate = await getLatestDate();

  let isValid = true;
  const PER_PAGE = 1000;
  let currentPage = 1;

  let payoutAccounts = [];
  const statsByDate = {};

  while (isValid) {
    const { history } = await rpc("account_history", {
      account: ACCOUNT,
      count: PER_PAGE,
      offset: (currentPage - 1) * PER_PAGE,
    });

    if (!history.length) {
      isValid = false;
    }

    for (let i = 0; i < history.length; i++) {
      const {
        account,
        type,
        amount,
        local_timestamp: localTimestamp,
      } = history[i];

      if (type === "send") {
        const date = formatDate(parseFloat(localTimestamp) * 1000);
        // Do not compile data for "today"
        if (date === formatDate(Date.now())) {
          continue;
        }

        payoutAccounts.push(account);

        // Do not compile stats for an already compiled date
        if (!latestDate || (latestDate && date > latestDate)) {
          if (!statsByDate[date]) {
            statsByDate[date] = {
              totalPayouts: 0,
              totalAccounts: 0,
              totalAccountsHolding: 0,
              totalBalanceHolding: 0,
              totalUniqueAccounts: 0,
              payoutAccounts: [],
              totalFiatPayouts: 0,
              date,
            };
          }

          statsByDate[date].payoutAccounts.push(account);
          statsByDate[date].totalPayouts = BigNumber(
            statsByDate[date].totalPayouts,
          )
            .plus(amount)
            .toNumber();
        }
      }

      if (history.length < PER_PAGE) {
        isValid = false;
      }
    }

    console.log(`Current page: ${currentPage}`);
    currentPage += 1;
  }

  const yesterday = formatDate(Date.now() - 60 * 60 * 24 * 1000);
  if (statsByDate[yesterday]) {
    const { hashrate, minersTotal, workersTotal } = await get2MinersPoolStats();

    statsByDate[yesterday].hashrate = hashrate;
    statsByDate[yesterday].minersTotal = minersTotal;
    statsByDate[yesterday].workersTotal = workersTotal;

    const { currentPrice = 0 } =
      nodeCache.get(`${COINGECKO_MARKET_STATS}-usd`) || {};
    const totalFiatPayouts =
      Math.round(
        currentPrice * rawToRai(statsByDate[yesterday].totalPayouts) * 100,
      ) / 100;

    statsByDate[yesterday].totalFiatPayouts = totalFiatPayouts;

    const uniqPayoutAccounts = uniq(payoutAccounts);

    const uniqAccountNonExchangeRepresentative = [];

    // @NOTE replace this by `accounts_representatives` RPC when v23 gets released
    // https://github.com/nanocurrency/nano-node/pull/3412
    // uniqPayoutAccounts.forEach(async account => {
    for (let i = 0; i < uniqPayoutAccounts.length; i++) {
      const nonExchangeAccount = await getAccountNonExchangeRepresentative(
        uniqPayoutAccounts[i],
      );
      if (nonExchangeAccount) {
        uniqAccountNonExchangeRepresentative.push(nonExchangeAccount);
      }
    }

    const chunkPayoutAccounts = chunk(
      uniqAccountNonExchangeRepresentative,
      PER_PAGE,
    );

    for (let i = 0; i < chunkPayoutAccounts.length; i++) {
      const { totalBalance, totalAccounts } = await getAccountsBalances(
        chunkPayoutAccounts[i],
      );

      statsByDate[yesterday].totalAccountsHolding = new BigNumber(
        statsByDate[yesterday].totalAccountsHolding,
      )
        .plus(totalAccounts)
        .toNumber();

      statsByDate[yesterday].totalBalanceHolding = new BigNumber(
        statsByDate[yesterday].totalBalanceHolding,
      )
        .plus(totalBalance)
        .toNumber();
    }

    statsByDate[yesterday].totalUniqueAccounts = uniqPayoutAccounts.length;
  }

  if (Object.values(statsByDate).length) {
    Object.values(statsByDate).forEach(
      ({
        totalPayouts,
        payoutAccounts,
        totalAccountsHolding,
        totalBalanceHolding,
        totalUniqueAccounts,
        hashrate,
        minersTotal,
        workersTotal,
        totalFiatPayouts,
        date,
      }) => {
        const uniqPayoutAccounts = uniq(payoutAccounts);

        db.collection(MINERS_STATS_COLLECTION).insertOne({
          totalPayouts: rawToRai(totalPayouts),
          totalAccounts: uniqPayoutAccounts.length,
          totalAccountsHolding,
          totalBalanceHolding,
          totalUniqueAccounts,
          hashrate,
          minersTotal,
          workersTotal,
          totalFiatPayouts,
          date,
        });
      },
    );

    console.log("Completed!");
  }
  // Reset cache
  nodeCache.set(MINERS_STATS, null);
};

const get2MinersPoolStats = async () => {
  let hashrate = 0;
  let minersTotal = 0;
  let workersTotal = 0;

  try {
    const res = await fetch(`https://eth.2miners.com/api/stats`);
    ({ hashrate, minersTotal, workersTotal } = await res.json());
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return {
    hashrate,
    minersTotal,
    workersTotal,
  };
};

// https://crontab.guru/#0_0_*_*_*
// “At midnight.”
cron.schedule("0 0 * * *", async () => {
  try {
    do2MinersStats();
  } catch (err) {
    Sentry.captureException(err);
  }
});

if (process.env.NODE_ENV === "production") {
  do2MinersStats();
}
