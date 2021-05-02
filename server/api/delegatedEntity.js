const { nodeCache } = require("../cache");
const { rpc } = require("../rpc");
const {
  KNOWN_ACCOUNTS_BALANCE,
  DELEGATED_ENTITY,
  EXPIRE_1H,
} = require("../constants");
const { BURN_ACCOUNT } = require("../../src/knownAccounts.json");

const getDelegatedEntity = async () => {
  return nodeCache.get(DELEGATED_ENTITY) || (await getEntities());
};

const getEntities = async () => {
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
                  representative === knownAccount.account ||
                  representative === BURN_ACCOUNT;

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

  nodeCache.set(
    DELEGATED_ENTITY,
    delegatedEntities.filter(Boolean),
    EXPIRE_1H,
  );

  return delegatedEntities.filter(Boolean);
};

module.exports = {
  getDelegatedEntity,
};
