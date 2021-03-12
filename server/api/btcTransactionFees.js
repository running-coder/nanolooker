const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const { Sentry } = require("../sentry");

const apiCache = new NodeCache({
  stdTTL: 3600,
  deleteOnExpire: true,
});

const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H =
  "TOTAL_BITCOIN_TRANSACTION_FEES_24H";
const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H =
  "TOTAL_BITCOIN_TRANSACTION_FEES_48H";

const getBtcTransactionFees = async () => {
  let btcTransactionFees24h = apiCache.get(
    TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  );
  let btcTransactionFees48h = apiCache.get(
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

      apiCache.set(
        TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
        btcTransactionFees24h,
      );
      apiCache.set(
        TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H,
        btcTransactionFees48h,
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
