const cron = require("node-cron");
const fetch = require("node-fetch");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const { NANOSPEED_STATS } = require("../constants");

const doNanoSpeedStats = async () => {
  try {
    const res = await fetch("https://api.nanospeed.info/conf-times-box-global?period=1D");

    const { q90: avgConfTimep90, median } = await res.json();

    nodeCache.set(NANOSPEED_STATS, { avgConfTimep90, median });
  } catch (err) {
    Sentry.captureException(err);
  }
};

// Every 15 smins
cron.schedule("*/15 * * * *", async () => {
  doNanoSpeedStats();
});

if (!nodeCache.get(NANOSPEED_STATS)) {
  doNanoSpeedStats();
}
