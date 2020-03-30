const fetch = require("node-fetch");
const NodeCache = require("node-cache");

const apiCache = new NodeCache({
  ttl: 86400,
  deleteOnExpire: true
});

const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H =
  "TOTAL_BITCOIN_TRANSACTION_FEES_24H";
const TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H =
  "TOTAL_BITCOIN_TRANSACTION_FEES_48H";

const getBtcTransactionFees = async () => {
  let btcTransactionFees24h = apiCache.get(
    TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H
  );
  let btcTransactionFees48h = apiCache.get(
    TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H
  );

  if (!btcTransactionFees24h || btcTransactionFees48h) {
    try {
      const res = await fetch(
        "https://api.blockchain.info/charts/transaction-fees?cors=true&format=json"
      );
      const { values } = await res.json();

      btcTransactionFees24h = values.pop().y;
      btcTransactionFees48h = values.pop().y;

      apiCache.set(
        TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
        btcTransactionFees24h
      );
      apiCache.set(
        TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H,
        btcTransactionFees48h
      );
    } catch (e) {}
  }

  return { btcTransactionFees24h, btcTransactionFees48h };
};

module.exports = {
  getBtcTransactionFees,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H
};
