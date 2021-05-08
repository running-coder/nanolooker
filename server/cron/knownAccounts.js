const cron = require("node-cron");
const BigNumber = require("bignumber.js");
const { doDelegatedEntitiesCron } = require("./delegatedEntity");
const { rawToRai } = require("../utils");
const { rpc } = require("../rpc");
const { nodeCache } = require("../client/cache");
const { Sentry } = require("../sentry");
const { KNOWN_ACCOUNTS, KNOWN_ACCOUNTS_BALANCE } = require("../constants");
const knownAccounts = require("../known-accounts.json");

const doKnownAccountsBalanceCron = async () => {
  let knownAccountsBalance = [];

  try {
    let accounts = knownAccounts.flatMap(({ account }) => [account]);

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

    nodeCache.set(KNOWN_ACCOUNTS_BALANCE, knownAccountsBalance);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return knownAccountsBalance;
};

// At every 15th minute.
// https://crontab.guru/#*/15_*_*_*_*
cron.schedule("*/15 * * * *", async () => {
  if (process.env.NODE_ENV !== "production") return;

  doKnownAccountsBalanceCron();
});

if (process.env.NODE_ENV === "production") {
  setImmediate(async () => {
    await doKnownAccountsBalanceCron();
    doDelegatedEntitiesCron();
  });
}

nodeCache.set(KNOWN_ACCOUNTS, knownAccounts);
