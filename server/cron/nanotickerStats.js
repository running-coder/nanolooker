const cron = require("node-cron");
const fetch = require("node-fetch");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const { NANOTICKER_STATS } = require("../constants");

const doNanotickerStats = async () => {
  try {
    const res = await fetch("https://nanoticker.info/json/stats.json");

    const { CPSMedian: cps } = await res.json();

    nodeCache.set(NANOTICKER_STATS, { cps });
  } catch (err) {
    //@NOTE throws too much....
    // Sentry.captureException(err);
  }
};

// Every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  doNanotickerStats();
});

if (!nodeCache.get(NANOTICKER_STATS)) {
  doNanotickerStats();
}
