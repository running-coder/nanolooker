const MongoClient = require("mongodb").MongoClient;
const cron = require("node-cron");
const BigNumber = require("bignumber.js");
const chunk = require("lodash/chunk");
const uniq = require("lodash/uniq");
const { rpc } = require("../rpc");
const { Sentry } = require("../sentry");
const { rawToRai } = require("../utils");
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  MINERS_STATS_COLLECTION,
} = require("../constants");

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

const get2MinersStats = async () => {
  await connect();

  const latestDate = await getLatestDate();

  let isValid = true;
  const PER_PAGE = 500;
  let currentPage = 1;

  // let payoutAccounts = [];
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
        // Do not compile stats for an already compiled date
        if (latestDate && date <= latestDate) {
          console.log(`Breaking loop ${date} <= ${latestDate}`);
          isValid = false;
          break;
        }

        if (!statsByDate[date]) {
          statsByDate[date] = {
            totalPayouts: 0,
            totalAccounts: 0,
            totalAccountsHolding: 0,
            totalBalanceHolding: 0,
            payoutAccounts: [],
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

      if (history.length < PER_PAGE) {
        isValid = false;
      }
    }

    console.log(`Current page: ${currentPage}`);
    currentPage += 1;
  }

  const yesterday = formatDate(Date.now() - 60 * 60 * 24 * 1000);
  if (statsByDate[yesterday]) {
    const uniqPayoutAccounts = uniq(statsByDate[yesterday].payoutAccounts);
    const chunkPayoutAccounts = chunk(uniqPayoutAccounts, PER_PAGE);

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
  }

  if (Object.values(statsByDate).length) {
    Object.values(statsByDate).forEach(
      ({
        totalPayouts,
        payoutAccounts,
        totalAccountsHolding,
        totalBalanceHolding,
        date,
      }) => {
        const uniqPayoutAccounts = uniq(payoutAccounts);

        db.collection(MINERS_STATS_COLLECTION).insertOne({
          totalPayouts: rawToRai(totalPayouts),
          totalAccounts: uniqPayoutAccounts.length,
          totalAccountsHolding,
          totalBalanceHolding,
          date,
        });
      },
    );
  }
};

// https://crontab.guru/#0_0_*_*_*
// “At midnight.”
cron.schedule("0 0 * * *", async () => {
  try {
    get2MinersStats();
  } catch (err) {
    Sentry.captureException(err);
  }
});
