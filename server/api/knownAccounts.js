const { nodeCache } = require("../cache");
const { KNOWN_ACCOUNTS, KNOWN_ACCOUNTS_BALANCE } = require("../constants");
const {
  doKnownAccountsCron,
  // doKnownAccountsBalanceCron,
} = require("../cron/knownAccounts");

const getKnownAccounts = async () => {
  let knownAccounts = nodeCache.get(KNOWN_ACCOUNTS);
  if (!knownAccounts) {
    knownAccounts = await doKnownAccountsCron();
  }
  return knownAccounts;
};

const getKnownAccountsBalance = async () => {
  let knownAccountsBalance = nodeCache.get(KNOWN_ACCOUNTS_BALANCE) || [];

  // Wait for cron to complete
  // if (!knownAccountsBalance) {
  //   const knownAccounts = await getKnownAccounts();
  //   knownAccountsBalance = await doKnownAccountsBalanceCron(knownAccounts);
  // }

  return knownAccountsBalance;
};

module.exports = {
  getKnownAccounts,
  getKnownAccountsBalance,
  KNOWN_ACCOUNTS,
};
