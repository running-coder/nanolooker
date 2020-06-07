const NodeCache = require("node-cache");
const sortBy = require("lodash/sortBy");
const reverse = require("lodash/reverse");
const { rpc } = require("../rpc");
const { DEVELOPER_FUND_ACCOUNTS } = require("../../src/knownAccounts.json");

const apiCache = new NodeCache({
  stdTTL: 3600,
  deleteOnExpire: true,
});

const DEVELOPER_FUND_TRANSACTIONS = "DEVELOPER_FUND_TRANSACTIONS";

const getDeveloperFundTransactions = async () => {
  let developerFundTransactions = apiCache.get(DEVELOPER_FUND_TRANSACTIONS);

  if (!developerFundTransactions) {
    let accountsHistory = [];
    const accountsHistoryPromises = [];

    DEVELOPER_FUND_ACCOUNTS.forEach(async account => {
      const promise = new Promise(async (resolve, reject) => {
        try {
          const res = await rpc("account_history", {
            account,
            count: "-1",
          });

          const history = res.history
            .map(({ type, height, ...rest }) =>
              type === "send" ? { origin: account, type, ...rest } : undefined,
            )
            .filter(Boolean);

          accountsHistory = accountsHistory.concat(history);

          resolve();
        } catch (e) {
          reject();
        }
      });

      accountsHistoryPromises.push(promise);
    });

    developerFundTransactions = await Promise.all(accountsHistoryPromises).then(
      () => {
        developerFundTransactions = reverse(
          sortBy(accountsHistory, ["local_timestamp"]),
        );

        apiCache.set(DEVELOPER_FUND_TRANSACTIONS, developerFundTransactions);

        return developerFundTransactions;
      },
    );
  }

  return { developerFundTransactions };
};

module.exports = {
  getDeveloperFundTransactions,
  DEVELOPER_FUND_TRANSACTIONS,
};
