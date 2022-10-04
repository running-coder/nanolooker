const { rpc } = require("../rpc");
const { Sentry } = require("../sentry");

const getIsAccountFilterable = async account => {
  let isFilterable = false;

  try {
    const res = await rpc("account_info", {
      account,
    });

    const { confirmation_height: confirmationHeight } = res;

    if (parseInt(confirmationHeight) <= 10_000) {
      isFilterable = true;
    }
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return isFilterable;
};

const getFilteredTransactions = async ({ account, filters }) => {
  console.log("~~~account", account);
  console.log("~~~filters", filters);
};

module.exports = {
  getIsAccountFilterable,
  getFilteredTransactions,
};
