const fs = require("fs");
const { join } = require("path");
const cron = require("node-cron");
const chunk = require("lodash/chunk");
const BigNumber = require("bignumber.js");
const { rawToRai } = require("../utils");
const {
  GENESIS_ACCOUNT,
} = require("../../src/pages/DeveloperFund/developerFundAccounts.json");
const { rpc } = require("../rpc");

const DISTRIBUTION_PATH = join(__dirname, "../data/distribution.json");
const DORMANT_FUNDS_PATH = join(__dirname, "../data/dormantFunds.json");
// Balance + pending below this amount will be ignored
const MIN_TOTAL = 0.001;

const getAccounts = async () => {
  const { count } = await rpc("frontier_count");
  const { frontiers } = await rpc("frontiers", {
    account: GENESIS_ACCOUNT,
    count,
  });
  return Object.keys(frontiers);
};

const getDistribution = async () => {
  // Distribution pattern
  // 0.001 < 1
  // 1 < 10
  // 10 < 100
  // 100 < 1000
  // 1000 < 10,000
  // 10,000 < 100,000
  // 100,000 < 1,000,000
  // 1,000,000 < 10,000,000
  // 10,000,000 < 100,000,000
  const distribution = Array.from({ length: 9 }, () => ({
    accounts: 0,
    balance: 0,
  }));

  // Funds that have not moved since X
  const dormantFunds = {};

  const accounts = await getAccounts();
  const balancesChunks = chunk(accounts, 1000);

  for (let i = 0; i < balancesChunks.length; i++) {
    let { balances } = await rpc("accounts_balances", {
      accounts: balancesChunks[i],
    });

    console.log(
      `processing balances chunk ${i + 1} of ${balancesChunks.length}`
    );

    await Promise.all(
      Object.entries(balances).map(
        async ([account, { balance: rawBalance, pending: rawPending }]) => {
          const balance = rawToRai(rawBalance);
          const pending = rawToRai(rawPending);
          const total = BigNumber(balance)
            .plus(pending)
            .toNumber();

          if (total < MIN_TOTAL) return;

          const {
            modified_timestamp: modifiedTimestamp,
          } = await rpc("account_info", { account });

          const date = new Date(parseFloat(modifiedTimestamp) * 1000);

          const year = date.getFullYear();
          const month = date.getMonth();

          if (!dormantFunds[year]) {
            dormantFunds[year] = [];
          }
          dormantFunds[year][month] = (dormantFunds[year][month] || 0) + total;

          let index = total >= 1 ? `${parseInt(total)}`.length : 0;

          distribution[index] = {
            accounts: (distribution[index].accounts += 1),
            balance: BigNumber(total)
              .plus(distribution[index].balance)
              .toNumber(),
          };
        }
      )
    );
  }

  return { distribution, dormantFunds };
};

const doDistributionCron = async () => {
  const startTime = new Date();
  console.log("Distribution cron started");

  const { distribution, dormantFunds } = await getDistribution();

  console.log(dormantFunds);

  fs.writeFileSync(DISTRIBUTION_PATH, JSON.stringify(distribution, null, 2));
  fs.writeFileSync(DORMANT_FUNDS_PATH, JSON.stringify(dormantFunds, null, 2));

  console.log(
    `Distribution cron finished in ${(new Date() - startTime) / 1000}s`
  );
};

// https://crontab.guru/#15_5_*_*_2,5
// “At 05:15 on Tuesday and Friday.”
cron.schedule("15 5 * * 2,5", async () => {
  if (process.env.NODE_ENV !== "production") return;
  doDistributionCron();
});

if (!fs.existsSync(DISTRIBUTION_PATH) || !fs.existsSync(DORMANT_FUNDS_PATH)) {
  // On app start, doDistributionCron if the data files do not exist
  doDistributionCron();
}
