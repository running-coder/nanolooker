const { nodeCache } = require("../client/cache");
const { KNOWN_ACCOUNTS, KNOWN_ACCOUNTS_BALANCE } = require("../constants");
const { doKnownAccountsCron } = require("../cron/knownAccounts");

const getKnownAccounts = async () => {
  let knownAccounts = nodeCache.get(KNOWN_ACCOUNTS);
  if (!knownAccounts) {
    knownAccounts = await doKnownAccountsCron();
  }
  return knownAccounts;
};

const getKnownAccountsBalance = async () => {
  const knownAccountsBalance = nodeCache.get(KNOWN_ACCOUNTS_BALANCE) || [];

  return knownAccountsBalance;
};

module.exports = {
  getKnownAccounts,
  getKnownAccountsBalance,
  KNOWN_ACCOUNTS,
};
