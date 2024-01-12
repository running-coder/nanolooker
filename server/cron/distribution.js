const fs = require("fs");
const util = require("util");
const { join } = require("path");
// const rimraf = require("rimraf");
const cron = require("node-cron");
const chunk = require("lodash/chunk");
const BigNumber = require("bignumber.js");

const { nodeCache } = require("../client/cache");
const { client: redisClient } = require("../client/redis");
const { Sentry } = require("../sentry");
const {
  EXPIRE_24H,
  EXPIRE_7D,
  DISTRIBUTION,
  DELEGATORS,
  DORMANT_FUNDS,
  KNOWN_EXCHANGES,
  REDIS_RICH_LIST,
  STATUS,
} = require("../constants");
const { rawToRai } = require("../utils");
const { BURN_ACCOUNT } = require("../../src/knownAccounts.json");
const { rpc } = require("../rpc");
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);

const { KNOWN_EXCHANGE_ACCOUNTS } = require("../../src/knownAccounts.json");

const DATA_ROOT_PATH = join(__dirname, "../data");
const TMP_ACCOUNTS_PATH = join(DATA_ROOT_PATH, "/tmp/account");
const DISTRIBUTION_PATH = join(DATA_ROOT_PATH, "/distribution.json");
const TMP_DISTRIBUTION_PATH = join(DATA_ROOT_PATH, "/tmp/distribution");
const DORMANT_FUNDS_PATH = join(DATA_ROOT_PATH, "/dormantFunds.json");
const KNOWN_EXCHANGES_PATH = join(DATA_ROOT_PATH, "knownExchanges.json");
const STATUS_PATH = join(DATA_ROOT_PATH, "/status.json");

// Balance + pending below this amount will be ignored
const MIN_TOTAL = 0.001;
const MIN_DELEGATOR_TOTAL = 1;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getAccounts = async () => {
  const { count } = await rpc("frontier_count");

  let currentAccountCount = 0;
  let nextAccount = BURN_ACCOUNT;
  let steps = 500_000;
  let nextCount = 0;
  let currentPage = 0;

  await mkdir(`${TMP_ACCOUNTS_PATH}`, { recursive: true });

  while (currentAccountCount < count) {
    nextCount = currentAccountCount + steps > count ? count - currentAccountCount : steps;

    const { frontiers } = await rpc("frontiers", {
      account: nextAccount,
      count: nextCount + 1,
    });

    console.log(`getting frontier`, {
      account: nextAccount,
      count: nextCount + 1,
      currentAccountCount,
    });

    const currentFrontiers = Object.keys(frontiers);
    // As the request was steps + 1, remove the first element which was the nextAccount
    currentFrontiers.shift();
    currentAccountCount += currentFrontiers.length;
    if (currentFrontiers.length) {
      nextAccount = currentFrontiers[currentFrontiers.length - 1];

      fs.writeFileSync(
        `${TMP_ACCOUNTS_PATH}/${currentPage}.json`,
        JSON.stringify(currentFrontiers, null, 2),
      );
      currentPage += 1;
    } else {
      console.log(`break frontier loop`, { currentFrontiers });
      break;
    }
  }
};

const getKnownExchanges = async () => {
  const { balances } = await rpc("accounts_balances", {
    accounts: KNOWN_EXCHANGE_ACCOUNTS,
  });

  return Object.entries(balances).reduce(
    (acc, [account, { balance: rawBalance, pending: rawPending }]) => {
      const balance = rawToRai(rawBalance);
      const pending = rawToRai(rawPending);
      const total = new BigNumber(balance).plus(pending).toNumber();

      return {
        ...acc,
        [account]: total,
      };
    },
    {},
  );
};

const getDistribution = async () => {
  // Distribution pattern
  // 0.001 - <1
  // 1 - <10
  // 10 - <100
  // 100 - <1000
  // 1000 - <10,000
  // 10,000 - <100,000
  // 100,000 - <1,000,000
  // 1,000,000 - <10,000,000
  // 10,000,000 - <100,000,000
  const distribution = Array.from({ length: 9 }, () => ({
    accounts: 0,
    balance: 0,
  }));

  // Funds that have not moved since X
  const dormantFunds = {};

  // Get the known exchange balance so when they are excluded from the distribution their balance matches the distribution buckets
  // eg. if accountA is in bucket C when the script generates the balances but a few days after accountA's balance now matches bucket D
  const knownExchanges = await getKnownExchanges();

  await mkdir(`${TMP_DISTRIBUTION_PATH}`, { recursive: true });

  await getAccounts();

  const tmpAccountFiles = await readdir(TMP_ACCOUNTS_PATH);

  for (let y = 0; y < tmpAccountFiles.length; y++) {
    const accounts = JSON.parse(
      fs.readFileSync(`${TMP_ACCOUNTS_PATH}/${tmpAccountFiles[y]}`, "utf8"),
    );
    const balancesChunks = chunk(accounts, 5000);

    for (let i = 0; i < balancesChunks.length; i++) {
      let { balances } = await rpc("accounts_balances", {
        accounts: balancesChunks[i],
      });

      console.log(
        `processing balances: ${tmpAccountFiles[y]} - chunk ${i + 1} of ${balancesChunks.length}`,
      );

      const richList = {};

      await Promise.all(
        Object.entries(balances).map(
          async ([account, { balance: rawBalance, pending: rawPending }]) => {
            const balance = rawToRai(rawBalance);
            const pending = rawToRai(rawPending);
            const total = new BigNumber(balance).plus(pending).toNumber();

            if (total < MIN_TOTAL) return;

            richList[account] = total;

            const index = total >= 1 ? `${parseInt(total)}`.length : 0;

            // Add the account as part of the Distribution
            distribution[index] = {
              accounts: (distribution[index].accounts += 1),
              balance: new BigNumber(total).plus(distribution[index].balance).toNumber(),
            };

            if (total > MIN_DELEGATOR_TOTAL) {
              const { representative } = await rpc("account_representative", {
                account,
              });

              redisClient.zadd(`${DELEGATORS}_TMP:${representative}`, total, account);
            }

            // Search for the last transaction date to place the accounts
            // balance and pending into the Dormant funds
            const { history } = await rpc("account_history", {
              account,
              count: 5,
              // Using raw allows to include "change" transactions
              raw: true,
            });

            const result = (history || []).find(
              ({ local_timestamp, subtype = "" }) =>
                ["change", "send", "receive"].includes(subtype) && parseInt(local_timestamp || "0"),
            );

            if (!result) return;

            // if (
            //   result.subtype === "change" &&
            //   parseFloat(result.local_timestamp) >=
            //     Math.floor(Date.now() / 1000) - 3600 * 24 * 2 &&
            //   history[1].subtype === "epoch"
            // ) {
            //   [].push({
            //     account,
            //     balance: total,
            //   });
            // }

            const date = new Date(parseFloat(result.local_timestamp) * 1000);

            const year = date.getFullYear();
            const month = date.getMonth();

            if (!dormantFunds[year]) {
              dormantFunds[year] = [];
            }
            dormantFunds[year][month] = (dormantFunds[year][month] || 0) + total;
          },
        ),
      );

      fs.writeFileSync(
        `${TMP_DISTRIBUTION_PATH}/${tmpAccountFiles[y]}`,
        JSON.stringify({ distribution, dormantFunds }, null, 2),
      );

      const richListData = Object.entries(richList).flatMap(acc => acc.reverse());

      redisClient.zadd(`${REDIS_RICH_LIST}_TMP`, ...richListData);

      // @TODO check if can remove the sleep now that the node is a bit more powerful
      await sleep(100);
    }
  }

  return { distribution, dormantFunds, knownExchanges };
};

const doDistributionCron = async () => {
  try {
    const startTime = new Date();
    console.log("Distribution cron started");

    const { distribution, dormantFunds, knownExchanges } = await getDistribution();

    fs.writeFileSync(DISTRIBUTION_PATH, JSON.stringify(distribution, null, 2));
    fs.writeFileSync(DORMANT_FUNDS_PATH, JSON.stringify(dormantFunds, null, 2));
    fs.writeFileSync(KNOWN_EXCHANGES_PATH, JSON.stringify(knownExchanges, null, 2));
    fs.writeFileSync(
      STATUS_PATH,
      JSON.stringify(
        {
          executionTime: (new Date() - startTime) / 1000,
          date: new Date(),
        },
        null,
        2,
      ),
    );

    console.log(`Distribution cron finished in ${(new Date() - startTime) / 1000}s`);

    nodeCache.set(DISTRIBUTION, distribution, EXPIRE_7D);
    nodeCache.set(DORMANT_FUNDS, dormantFunds, EXPIRE_7D);
    nodeCache.set(KNOWN_EXCHANGES, knownExchanges, EXPIRE_24H);

    // @NOTE manual add for now
    redisClient.zadd(`${REDIS_RICH_LIST}_TMP`, 207035873.510723, BURN_ACCOUNT);
    redisClient.rename(`${REDIS_RICH_LIST}_TMP`, REDIS_RICH_LIST);

    // Replace previously generated delegators by new ones
    redisClient.keys(`${DELEGATORS}:*`, (err, res) => {
      if (err) {
        Sentry.captureException(err);
        return;
      }

      redisClient.del(...res, () => {
        redisClient.keys(`${DELEGATORS}_TMP:*`, (err, res) => {
          if (err) {
            Sentry.captureException(err);
            return;
          }

          res.forEach(key => {
            redisClient.rename(key, key.replace("_TMP", ""));
          });
        });
      });
    });

    // rimraf(TMP_ACCOUNTS_PATH, () => {});
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

// https://crontab.guru/#15_5_*_*_1
// “At 05:15 on Monday.”
cron.schedule("15 5 * * 1", async () => {
  if (process.env.NODE_ENV !== "production") return;
  // Disable cron until amounts are sorted out
  doDistributionCron();
});

// if (
//   process.env.NODE_ENV === "production" &&
//   !fs.existsSync(DISTRIBUTION_PATH) &&
//   !fs.existsSync(DORMANT_FUNDS_PATH) &&
//   !fs.existsSync(KNOWN_EXCHANGES_PATH) &&
//   !fs.existsSync(STATUS_PATH)
// ) {
// doDistributionCron();
// }

const getDistributionData = () => {
  let distribution = nodeCache.get(DISTRIBUTION);
  let dormantFunds = nodeCache.get(DORMANT_FUNDS);
  let knownExchanges = nodeCache.get(KNOWN_EXCHANGES);
  let status = nodeCache.get(STATUS);

  if (!distribution) {
    distribution = fs.existsSync(DISTRIBUTION_PATH)
      ? JSON.parse(fs.readFileSync(DISTRIBUTION_PATH, "utf8"))
      : [];
    nodeCache.set(DISTRIBUTION, distribution, EXPIRE_7D);
  }

  if (!dormantFunds) {
    dormantFunds = fs.existsSync(DORMANT_FUNDS_PATH)
      ? JSON.parse(fs.readFileSync(DORMANT_FUNDS_PATH, "utf8"))
      : {};
    nodeCache.set(DORMANT_FUNDS, dormantFunds, EXPIRE_7D);
  }

  if (!knownExchanges) {
    knownExchanges = fs.existsSync(KNOWN_EXCHANGES_PATH)
      ? JSON.parse(fs.readFileSync(KNOWN_EXCHANGES_PATH, "utf8"))
      : {};
    nodeCache.set(KNOWN_EXCHANGES, knownExchanges, EXPIRE_24H);
  }

  if (!status) {
    status = fs.existsSync(STATUS_PATH) ? JSON.parse(fs.readFileSync(STATUS_PATH, "utf8")) : {};
    nodeCache.set(STATUS, status, EXPIRE_7D);
  }

  return {
    status,
    distribution,
    dormantFunds,
    knownExchanges,
  };
};

module.exports = {
  getDistributionData,
};
