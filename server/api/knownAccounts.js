const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const BigNumber = require("bignumber.js");
const { rawToRai } = require("../utils");
const { rpc } = require("../rpc");

const apiCache = new NodeCache({
  stdTTL: 120,
  deleteOnExpire: true,
});

const KNOWN_ACCOUNTS = "KNOWN_ACCOUNTS";

const getKnownAccounts = async () => {
  let knownAccounts = apiCache.get(KNOWN_ACCOUNTS);

  if (!knownAccounts) {
    try {
      const res = await fetch("https://mynano.ninja/api/accounts/aliases");
      knownAccounts = await res.json();

      const accounts = knownAccounts.flatMap(({ account }) => [account]);

      const { balances } = await rpc("accounts_balances", {
        accounts,
      });

      knownAccounts = knownAccounts
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
                  balances[account].pending || 0
                )
              )
            : 0,
        }))
        .filter(({ alias }) => !!alias);

      apiCache.set(KNOWN_ACCOUNTS, knownAccounts);
    } catch (err) {
      console.log(err);
    }
  }

  return { knownAccounts };
};

module.exports = {
  getKnownAccounts,
  KNOWN_ACCOUNTS,
};
