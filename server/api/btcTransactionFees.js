const fetch = require("node-fetch");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../cache");
const { EXPIRE_1H } = require("../constants");

const BITCOIN_TOTAL_TRANSACTION_FEES_24H =
  "BITCOIN_TOTAL_TRANSACTION_FEES_24H";
const BITCOIN_TOTAL_TRANSACTION_FEES_48H =
  "BITCOIN_TOTAL_TRANSACTION_FEES_48H";

const getBtcTransactionFees = async () => {
  let btcTransactionFees24h = nodeCache.get(
    BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  );
  let btcTransactionFees48h = nodeCache.get(
    BITCOIN_TOTAL_TRANSACTION_FEES_48H,
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
        BITCOIN_TOTAL_TRANSACTION_FEES_24H,
        btcTransactionFees24h,
        EXPIRE_1H,
      );
      nodeCache.set(
        BITCOIN_TOTAL_TRANSACTION_FEES_48H,
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
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
};
