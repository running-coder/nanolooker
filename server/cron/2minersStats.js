const fetch = require("node-fetch");
// const cron = require("node-cron");
const BigNumber = require("bignumber.js");
const chunk = require("lodash/chunk");
const uniq = require("lodash/uniq");
const { rpc } = require("../rpc");
const { Sentry } = require("../sentry");
const { rawToRai } = require("../utils");
const { nodeCache } = require("../client/cache");
const db = require("../client/mongo");
const { MINERS_STATS, MINERS_STATS_COLLECTION } = require("../constants");
const exchanges = require("../../src/exchanges.json");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const exchangeAccounts = exchanges.map(({ account }) => account);

const MIN_RECEIVE_AMOUNT = 100;
const MIN_HOLDING_AMOUNT = 0.001;
const MIN_DATE = "2021-10-12";
const ACCOUNT = "nano_14uzbiw1euwicrt3gzwnpyufpa8td1uw8wbhyyrz5e5pnqitjfk1tb8xwgg4";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = date.getFullYear();

  return [year, month, day].join("-");
}

const processData = async ({ stats }) => {
  const PER_PAGE = 500;

  stats.totalFiatPayouts =
    Math.round((stats.blocks[0].price || 0) * rawToRai(stats.totalPayouts) * 100) / 100;
  stats.payoutAccounts = uniq(stats.payoutAccounts);
  stats.totalAccounts = stats.payoutAccounts.length;

  const nonExchangeRepresentativeAccount = [];

  // @NOTE replace this by `accounts_representatives` RPC when v24 gets released
  // https://github.com/nanocurrency/nano-node/pull/3412
  for (let i = 0; i < stats.payoutAccounts.length; i++) {
    const nonExchangeAccount = await getAccountNonExchangeRepresentative(stats.payoutAccounts[i]);

    if (nonExchangeAccount) {
      nonExchangeRepresentativeAccount.push(nonExchangeAccount);
    }
  }

  const chunkPayoutAccounts = chunk(nonExchangeRepresentativeAccount, PER_PAGE);

  for (let i = 0; i < chunkPayoutAccounts.length; i++) {
    const { totalBalance, totalAccounts } = await getAccountsBalances(chunkPayoutAccounts[i]);

    stats.totalAccountsHolding = new BigNumber(stats.totalAccountsHolding)
      .plus(totalAccounts)
      .toNumber();

    stats.totalBalanceHolding = new BigNumber(stats.totalBalanceHolding)
      .plus(totalBalance)
      .toNumber();
  }

  stats.totalPayouts = rawToRai(stats.totalPayouts);

  // Too heaving saving them, instead store uniqueAccounts on the latest date
  delete stats.payoutAccounts;

  const database = await db.getDatabase();
  if (database) {
    await database.collection(MINERS_STATS_COLLECTION).insertOne(stats);
  }
};

const getAccountsBalances = async accounts => {
  if (!accounts.length) return;

  const { balances } = await rpc("accounts_balances", {
    accounts,
  });

  let totalAccounts = 0;
  let totalBalance = 0;
  if (Object.keys(balances).length) {
    Object.values(balances).forEach(({ balance, pending }) => {
      const accountBalance = rawToRai(BigNumber(balance).plus(pending).toNumber());

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

const getLatestEntry = async () => {
  // eslint-disable-next-line no-loop-func
  const latestEntry = await new Promise(async (resolve, reject) => {
    const database = await db.getDatabase();
    if (database) {
      database
        .collection(MINERS_STATS_COLLECTION)
        .find({ pool: "2Miners" })
        .sort({ date: -1 })
        .limit(1)
        .toArray()
        .then(([data = {}]) => {
          console.log(`Most recent date: ${data.date}`);
          resolve(data);
        });
    }
  });

  return latestEntry;
};

const do2MinersStats = async () => {
  const { date: latestDate } = (await getLatestEntry()) || {};
  const PER_PAGE = 500;
  const statsByDate = {};

  let isValid = true;
  let currentPage = 1;
  let currentDateToInsert = null;

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
      const { account, type, amount, local_timestamp: localTimestamp } = history[i];

      const date = formatDate(parseFloat(localTimestamp) * 1000);
      // Do not compile data for "today"
      if (date === formatDate(Date.now())) {
        continue;
      }

      if (!statsByDate[date]) {
        if (currentDateToInsert) {
          console.log(`Process data for ${currentDateToInsert}`);
          await processData({
            stats: statsByDate[currentDateToInsert],
          });

          delete statsByDate[currentDateToInsert];
        }
        // Do not compile stats for an already compiled date
        if (date < MIN_DATE || (latestDate && date <= latestDate)) {
          isValid = false;
          console.log("Invalid date for today", { date, latestDate });
          break;
        }

        currentDateToInsert = date;

        statsByDate[date] = {
          pool: "2Miners",
          totalPayouts: 0,
          totalAccounts: 0,
          totalAccountsHolding: 0,
          totalBalanceHolding: 0,
          payoutAccounts: [],
          blocks: [],
          totalFiatPayouts: 0,
          date,
        };
      }

      if (type === "receive") {
        const receivedAmount = rawToRai(amount);
        if (receivedAmount > MIN_RECEIVE_AMOUNT) {
          // CoinGecko rate limit
          await sleep(1500);
          const price = await getCoingeckoPrice(parseInt(localTimestamp));

          statsByDate[date].blocks.push({
            ...history[i],
            price,
          });
        }
      } else if (type === "send") {
        statsByDate[date].payoutAccounts.push(account);
        statsByDate[date].totalPayouts = BigNumber(statsByDate[date].totalPayouts)
          .plus(amount)
          .toNumber();
      }

      if (history.length < PER_PAGE) {
        isValid = false;
      }
    }

    console.log(`Current page: ${currentPage}`);
    currentPage += 1;
  }

  console.log("Completed!");

  // Reset cache
  nodeCache.set(MINERS_STATS, null);
};

const getCoingeckoPrice = async timestamp => {
  let price = 0;

  // Get the price from before the tx happened on the network
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/nano/market_chart/range?vs_currency=usd&from=${
        timestamp - 4000
      }&to=${timestamp + 4000}`,
    );

    const { prices } = await res.json();
    price = prices[0][1];
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return price;
};

// https://crontab.guru/#0_0_*_*_*
// “At midnight.”
// cron.schedule("0 0 * * *", async () => {
//   try {
//     do2MinersStats();
//   } catch (err) {
//     Sentry.captureException(err);
//   }
// });

// if (process.env.NODE_ENV === "production") {
//   do2MinersStats();
// }
