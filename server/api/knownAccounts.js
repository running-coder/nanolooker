const { nodeCache } = require("../cache");
const { KNOWN_ACCOUNTS, KNOWN_ACCOUNTS_BALANCE } = require("../constants");

const getKnownAccounts = async () => {
  const knownAccounts = nodeCache.get(KNOWN_ACCOUNTS) || [];

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
