const sortBy = require("lodash/sortBy");
const reverse = require("lodash/reverse");
const { nodeCache } = require("../client/cache");
const { Sentry } = require("../sentry");
const { rpc } = require("../rpc");
const { DEVELOPER_FUND_ACCOUNTS } = require("../../src/knownAccounts.json");
const { EXPIRE_1H } = require("../constants");

const DEVELOPER_FUND_TRANSACTIONS = "DEVELOPER_FUND_TRANSACTIONS";

const getDeveloperFundTransactions = async () => {
  let developerFundTransactions = nodeCache.get(DEVELOPER_FUND_TRANSACTIONS);

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

          const { history = [] } =
            res ||
            []
              .map(({ type, height, ...rest }) =>
                type === "send" ? { origin: account, type, ...rest } : undefined,
              )
              .filter(Boolean);

          accountsHistory = accountsHistory.concat(history);

          resolve();
        } catch (err) {
          console.log("Error", err);
          Sentry.captureException(err);
          reject();
        }
      });

      accountsHistoryPromises.push(promise);
    });

    developerFundTransactions = await Promise.all(accountsHistoryPromises).then(() => {
      developerFundTransactions = reverse(sortBy(accountsHistory, ["local_timestamp"]));

      nodeCache.set(DEVELOPER_FUND_TRANSACTIONS, developerFundTransactions, EXPIRE_1H);

      return developerFundTransactions;
    });
  }

  return { developerFundTransactions };
};

module.exports = {
  getDeveloperFundTransactions,
  DEVELOPER_FUND_TRANSACTIONS,
};
