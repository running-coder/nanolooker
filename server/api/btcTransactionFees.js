const fetch = require("node-fetch");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../cache");
const { EXPIRE_1H } = require("../constants");

const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H =
  "TOTAL_BITCOIN_TRANSACTION_FEES_24H";
const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H =
  "TOTAL_BITCOIN_TRANSACTION_FEES_48H";

const getBtcTransactionFees = async () => {
  let btcTransactionFees24h = nodeCache.get(
    TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  );
  let btcTransactionFees48h = nodeCache.get(
    TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H,
  );

  if (!btcTransactionFees24h || btcTransactionFees48h) {
    try {
      const res = await fetch(
        "https://api.blockchain.info/charts/transaction-fees?cors=true&format=json",
      );
      const { values } = await res.json();

      btcTransactionFees24h = values.pop().y;
      btcTransactionFees48h = values.pop().y;

      nodeCache.set(
        TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
        btcTransactionFees24h,
        EXPIRE_1H,
      );
      nodeCache.set(
        TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H,
        btcTransactionFees48h,
        EXPIRE_1H,
      );
    } catch (err) {
      console.log("Error", err);
      Sentry.captureException(err);
    }
  }

  return { btcTransactionFees24h, btcTransactionFees48h };
};

module.exports = {
  getBtcTransactionFees,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H,
};
