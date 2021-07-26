const { nodeCache } = require("../client/cache");
const {
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
} = require("../constants");

const getBtcTransactionFees = async () => {
  let btcTransactionFees24h = nodeCache.get(BITCOIN_TOTAL_TRANSACTION_FEES_24H);
  let btcTransactionFees48h = nodeCache.get(BITCOIN_TOTAL_TRANSACTION_FEES_48H);

  return { btcTransactionFees24h, btcTransactionFees48h };
};

module.exports = {
  getBtcTransactionFees,
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
};
