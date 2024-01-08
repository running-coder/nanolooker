const { nodeCache } = require("../client/cache");
const {
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_7D,
  BITCOIN_TOTAL_TRANSACTION_FEES_14D,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
} = require("../constants");

const getBtcTransactionFees = async () => {
  let btcTransactionFees24h = nodeCache.get(BITCOIN_TOTAL_TRANSACTION_FEES_24H);
  let btcTransactionFees7d = nodeCache.get(BITCOIN_TOTAL_TRANSACTION_FEES_7D);
  let btcTransactionFees14d = nodeCache.get(BITCOIN_TOTAL_TRANSACTION_FEES_14D);
  let btcTransactionFees48h = nodeCache.get(BITCOIN_TOTAL_TRANSACTION_FEES_48H);

  return {
    btcTransactionFees24h,
    btcTransactionFees7d,
    btcTransactionFees14d,
    btcTransactionFees48h,
  };
};

module.exports = {
  getBtcTransactionFees,
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_7D,
  BITCOIN_TOTAL_TRANSACTION_FEES_14D,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
};
