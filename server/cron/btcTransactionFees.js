const cron = require("node-cron");
const fetch = require("node-fetch");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const {
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
} = require("../constants");

const getBtcTransactionFees = async () => {
  let res;
  try {
    const res = await fetch(
      "https://api.blockchain.info/charts/transaction-fees?cors=true&format=json",
    );
    const { values } = await res.json();

    const btcTransactionFees24h = values.pop().y;
    const btcTransactionFees48h = values.pop().y;

    nodeCache.set(BITCOIN_TOTAL_TRANSACTION_FEES_24H, btcTransactionFees24h);
    nodeCache.set(BITCOIN_TOTAL_TRANSACTION_FEES_48H, btcTransactionFees48h);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err, { extra: { res } });
  }
};

//https://crontab.guru/#15_*_*_*_*
// At minute 15.
cron.schedule("15 * * * *", async () => {
  getBtcTransactionFees();
});

getBtcTransactionFees();
