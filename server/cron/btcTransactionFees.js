const cron = require("node-cron");
const fetch = require("node-fetch");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const BigNumber = require("bignumber.js");
const {
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_7D,
  BITCOIN_TOTAL_TRANSACTION_FEES_14D,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
} = require("../constants");

const getBtcTransactionFees = async () => {
  let res;
  let btcTransactionFees7dTotal = 0;
  let btcTransactionFees14dTotal = 0;


  try {
    const res = await fetch(
      "https://api.blockchain.info/charts/transaction-fees?cors=true&format=json",
    );
    const { values } = await res.json();

    const btcTransactionFees24h = values.slice(-1)[0].y;
    const btcTransactionFees48h = values.slice(-2)[0].y;
    let rawBtcTransactionFees14d = values.slice(-14);


    for (let i = 0; i < rawBtcTransactionFees14d.length; i++) {

      if (i < 7) {
        // Use < 7 to get the last 7 days (0 to 6)
        btcTransactionFees7dTotal += rawBtcTransactionFees14d[i].y;
      }
      btcTransactionFees14dTotal += rawBtcTransactionFees14d[i].y;
    }

    nodeCache.set(BITCOIN_TOTAL_TRANSACTION_FEES_24H, btcTransactionFees24h);
    nodeCache.set(BITCOIN_TOTAL_TRANSACTION_FEES_7D, btcTransactionFees7dTotal);
    nodeCache.set(BITCOIN_TOTAL_TRANSACTION_FEES_14D, btcTransactionFees14dTotal);
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
