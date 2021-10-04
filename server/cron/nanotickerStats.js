const cron = require("node-cron");
const fetch = require("node-fetch");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const { NANOTICKER_STATS } = require("../constants");

const getNanotickerStats = async () => {
  let res;

  try {
    const res = await fetch("https://nanoticker.info/json/stats.json");

    const { CPSMedian: cps } = await res.json();

    nodeCache.set(NANOTICKER_STATS, { cps });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err, { extra: { res } });
  }
};

// Every 3 seconds
cron.schedule("*/3 * * * * *", async () => {
  getNanotickerStats();
});
