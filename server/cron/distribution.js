const fs = require("fs");
const util = require("util");
const { join } = require("path");
const rimraf = require("rimraf");
const NodeCache = require("node-cache");
const cron = require("node-cron");
const chunk = require("lodash/chunk");
const BigNumber = require("bignumber.js");
const { Sentry } = require("../sentry");
const {
  EXPIRE_24H,
  DISTRIBUTION,
  DORMANT_FUNDS,
  STATUS,
} = require("../constants");
const { rawToRai } = require("../utils");
const { BURN_ACCOUNT } = require("../../src/knownAccounts.json");
const { rpc } = require("../rpc");
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);

const distributionCache = new NodeCache({
  stdTTL: EXPIRE_24H,
  deleteOnExpire: true,
});

const TMP_ACCOUNTS_PATH = join(__dirname, "../data/tmp");
const DISTRIBUTION_PATH = join(__dirname, "../data/distribution.json");
const DORMANT_FUNDS_PATH = join(__dirname, "../data/dormantFunds.json");
const STATUS_PATH = join(__dirname, "../data/status.json");
// Balance + pending below this amount will be ignored
const MIN_TOTAL = 0.001;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getAccounts = async () => {
  const { count } = await rpc("frontier_count");

  let currentAccountCount = 0;
  let nextAccount = BURN_ACCOUNT;
  let steps = 500000;
  let nextCount = 0;

  let currentPage = 0;

  rimraf(TMP_ACCOUNTS_PATH, () => {});
  await mkdir(`${TMP_ACCOUNTS_PATH}`, { recursive: true });

  while (currentAccountCount < count) {
    nextCount =
      currentAccountCount + steps > count ? count - currentAccountCount : steps;

    const { frontiers } = await rpc("frontiers", {
      account: nextAccount,
      count: nextCount + 1,
    });

    console.log(`getting frontier ${nextAccount}, count ${nextCount + 1}`);

    const currentFrontiers = Object.keys(frontiers);
    currentFrontiers.shift();
    currentAccountCount += currentFrontiers.length;
    if (currentFrontiers.length) {
      nextAccount = currentFrontiers[currentFrontiers.length - 1];

      fs.writeFileSync(
        `${TMP_ACCOUNTS_PATH}/${currentPage}.json`,
        JSON.stringify(currentFrontiers, null, 2),
      );
      currentPage += 1;
    }
  }
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
        `processing balances: ${tmpAccountFiles[y]} - chunk ${i + 1} of ${
          balancesChunks.length
        }`,
      );

      await Promise.all(
        Object.entries(balances).map(
          async ([account, { balance: rawBalance, pending: rawPending }]) => {
            const balance = rawToRai(rawBalance);
            const pending = rawToRai(rawPending);
            const total = new BigNumber(balance).plus(pending).toNumber();

            if (total < MIN_TOTAL) return;

            // const {
            //   modified_timestamp: modifiedTimestamp,
            // } = await rpc("account_info", { account });

            const { history } = await rpc("account_history", {
              account,
              count: 2,
            });

            const result =
              history &&
              history.find(({ local_timestamp: localTimestamp }) => {
                const timestamp = parseInt(localTimestamp);

                return (
                  timestamp &&
                  (localTimestamp < 1598572800 || localTimestamp > 1598659200)
                );
              });
            if (!result) return;
            const modifiedTimestamp = result.local_timestamp;

            const date = new Date(parseFloat(modifiedTimestamp) * 1000);

            const year = date.getFullYear();
            const month = date.getMonth();

            if (!dormantFunds[year]) {
              dormantFunds[year] = [];
            }
            dormantFunds[year][month] =
              (dormantFunds[year][month] || 0) + total;

            let index = total >= 1 ? `${parseInt(total)}`.length : 0;

            distribution[index] = {
              accounts: (distribution[index].accounts += 1),
              balance: new BigNumber(total)
                .plus(distribution[index].balance)
                .toNumber(),
            };
          },
        ),
      );

      await sleep(1000);
    }
  }

  return { distribution, dormantFunds };
};

const doDistributionCron = async () => {
  try {
    const startTime = new Date();
    console.log("Distribution cron started");

    const { distribution, dormantFunds } = await getDistribution();

    fs.writeFileSync(DISTRIBUTION_PATH, JSON.stringify(distribution, null, 2));
    fs.writeFileSync(DORMANT_FUNDS_PATH, JSON.stringify(dormantFunds, null, 2));
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

    console.log(
      `Distribution cron finished in ${(new Date() - startTime) / 1000}s`,
    );

    distributionCache.set(DISTRIBUTION, distribution);
    distributionCache.set(DORMANT_FUNDS, dormantFunds);

    rimraf(TMP_ACCOUNTS_PATH, () => {});
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
  }
};

// https://crontab.guru/#15_5_*_*_2,5
// “At 05:15 on Tuesday and Friday.”
cron.schedule("15 5 * * 2,5", async () => {
  if (process.env.NODE_ENV !== "production") return;
  // Disable cron until amounts are sorted out
  // doDistributionCron();
});

const getDistributionData = () => {
  let distribution = distributionCache.get(DISTRIBUTION);
  let dormantFunds = distributionCache.get(DORMANT_FUNDS);
  let status = distributionCache.get(STATUS);

  if (!distribution) {
    distribution = fs.existsSync(DISTRIBUTION_PATH)
      ? JSON.parse(fs.readFileSync(DISTRIBUTION_PATH, "utf8"))
      : [];
    distributionCache.set(DISTRIBUTION, distribution);
  }

  if (!dormantFunds) {
    dormantFunds = fs.existsSync(DORMANT_FUNDS_PATH)
      ? JSON.parse(fs.readFileSync(DORMANT_FUNDS_PATH, "utf8"))
      : {};
    distributionCache.set(DORMANT_FUNDS, dormantFunds);
  }

  if (!status) {
    status = fs.existsSync(STATUS_PATH)
      ? JSON.parse(fs.readFileSync(STATUS_PATH, "utf8"))
      : {};
    distributionCache.set(STATUS, status);
  }

  return {
    status,
    distribution,
    dormantFunds,
  };
};

module.exports = {
  getDistributionData,
};
