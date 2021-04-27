const fetch = require("node-fetch");
const cron = require("node-cron");
const BigNumber = require("bignumber.js");
const { rawToRai } = require("../utils");
const { rpc } = require("../rpc");
const { nodeCache } = require("../cache");
const { Sentry } = require("../sentry");
const { KNOWN_ACCOUNTS, KNOWN_ACCOUNTS_BALANCE } = require("../constants");

const doKnownAccountsCron = async () => {
  let knownAccounts = [];
  try {
    const res = await fetch("https://mynano.ninja/api/accounts/aliases");
    knownAccounts = (await res.json()) || [];

    nodeCache.set(KNOWN_ACCOUNTS, knownAccounts);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return knownAccounts;
};

const doKnownAccountsBalanceCron = async knownAccounts => {
  let knownAccountsBalance = [];

  try {
    const accounts = knownAccounts.flatMap(({ account }) => [account]);

    // @TODO put the low balance account (< 1NANO) on a 48h update rotation

    const { balances } =
      (await rpc("accounts_balances", {
        accounts,
      })) || {};

    knownAccountsBalance = balances
      ? knownAccounts
          .map(({ account, alias }) => ({
            account,
            alias,
            balance: balances[account]
              ? rawToRai(new BigNumber(balances[account].balance || 0))
              : 0,
            pending: balances[account]
              ? rawToRai(new BigNumber(balances[account].pending || 0))
              : 0,
            total: balances[account]
              ? rawToRai(
                  new BigNumber(balances[account].balance || 0).plus(
                    balances[account].pending || 0,
                  ),
                )
              : 0,
          }))
          .filter(({ alias }) => !!alias)
      : [];

    nodeCache.set(KNOWN_ACCOUNTS_BALANCE, knownAccounts);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return knownAccountsBalance;
};

// Once every 5 minutes
// https://crontab.guru/#*/5_*_*_*_*
cron.schedule("*/5 * * * *", async () => {
  if (process.env.NODE_ENV !== "production") return;

  doKnownAccountsCron();
});

// Once per hour at minute 15
// https://crontab.guru/#15_*_*_*_*
cron.schedule("15 * * * *", async () => {
  if (process.env.NODE_ENV !== "production") return;

  doKnownAccountsBalanceCron();
});

if (process.env.NODE_ENV === "production") {
  // Only do this one, since it will do the other
  doKnownAccountsBalanceCron();
}

module.exports = {
  doKnownAccountsCron,
  doKnownAccountsBalanceCron,
};
