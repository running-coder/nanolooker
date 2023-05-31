const cron = require("node-cron");
const { nodeCache } = require("../client/cache");
const { rpc } = require("../rpc");
const { KNOWN_ACCOUNTS_BALANCE, DELEGATED_ENTITY } = require("../constants");
const { BURN_ACCOUNT } = require("../../src/knownAccounts.json");

const doDelegatedEntitiesCron = async () => {
  const knownAccountsBalance = nodeCache.get(KNOWN_ACCOUNTS_BALANCE) || [];

  const filteredKnownAccountsBalance = knownAccountsBalance.filter(
    ({ account, total }) => total >= 50000 && account !== BURN_ACCOUNT,
  );

  const delegatedEntities = filteredKnownAccountsBalance.length
    ? await Promise.all(
        filteredKnownAccountsBalance.map(
          async knownAccount =>
            new Promise(async (resolve, reject) => {
              try {
                const { representative } = await rpc("account_representative", {
                  account: knownAccount.account,
                });

                const isSelfDelegated =
                  representative === knownAccount.account || representative === BURN_ACCOUNT;

                if (!isSelfDelegated) {
                  knownAccount.representative = representative;
                }

                resolve(!isSelfDelegated ? knownAccount : undefined);
              } catch (err) {
                reject();
              }
            }),
        ),
      )
    : [];

  nodeCache.set(DELEGATED_ENTITY, delegatedEntities.filter(Boolean));
};

// https://crontab.guru/#10_*_*_*_*
// At minute 10.
cron.schedule("10 * * * *", async () => {
  if (process.env.NODE_ENV !== "production") return;

  doDelegatedEntitiesCron();
});

module.exports = {
  doDelegatedEntitiesCron,
};
