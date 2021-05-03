const cron = require("node-cron");
const { rpc } = require("../rpc");
const { nodeCache } = require("../cache");
const { Sentry } = require("../sentry");
const { TELEMETRY } = require("../constants");

const doTelemetryCron = async () => {
  let knownAccounts = [];
  try {
    const telemetry = await rpc("telemetry");
    const { metrics } = await rpc("telemetry", {
      raw: true,
    });

    const percentiles = calculatePercentiles(metrics);
    percentiles.p100 = {
      blockCount: Number(telemetry.block_count),
      cementedCount: Number(telemetry.cemented_count),
      uncheckedCount: Number(telemetry.unchecked_count),
      accountCount: Number(telemetry.account_count),
      bandwidthCap: Number(telemetry.bandwidth_cap),
      peerCount: Number(telemetry.peer_count),
      uptime: Number(telemetry.uptime),
      // activeDifficulty: telemetry.active_difficulty,
    };

    nodeCache.set(TELEMETRY, percentiles);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return knownAccounts;
};

const calculatePercentiles = metrics => {
  const blockCount = [];
  const cementedCount = [];
  const uncheckedCount = [];
  const accountCount = [];
  const bandwidthCap = [];
  const peerCount = [];
  const uptime = [];
  const activeDifficulty = [];

  const percentiles = {
    p50: {},
    p95: {},
  };

  metrics.forEach(metric => {
    blockCount.push(metric.block_count);
    cementedCount.push(metric.cemented_count);
    uncheckedCount.push(metric.unchecked_count);
    accountCount.push(metric.account_count);
    bandwidthCap.push(metric.bandwidth_cap);
    peerCount.push(metric.peer_count);
    uptime.push(metric.uptime);
    activeDifficulty.push(metric.active_difficulty);
  });

  blockCount.sort((a, b) => b - a);
  cementedCount.sort((a, b) => b - a);
  uncheckedCount.sort((a, b) => b - a);
  accountCount.sort((a, b) => b - a);
  bandwidthCap.sort((a, b) => b - a);
  peerCount.sort((a, b) => b - a);
  uptime.sort((a, b) => b - a);

  percentiles.p50.blockCount = calculateAverage([...blockCount], 0.5);
  percentiles.p95.blockCount = calculateAverage([...blockCount], 0.95);

  percentiles.p50.cementedCount = calculateAverage([...cementedCount], 0.5);
  percentiles.p95.cementedCount = calculateAverage([...cementedCount], 0.95);

  percentiles.p50.uncheckedCount = calculateAverage([...uncheckedCount], 0.5);
  percentiles.p95.uncheckedCount = calculateAverage([...uncheckedCount], 0.95);

  percentiles.p50.accountCount = calculateAverage([...accountCount], 0.5);
  percentiles.p95.accountCount = calculateAverage([...accountCount], 0.95);

  // @TODO consider 0 being unlimited
  percentiles.p50.bandwidthCap = calculateAverage([...bandwidthCap], 0.5);
  percentiles.p95.bandwidthCap = calculateAverage([...bandwidthCap], 0.95);

  percentiles.p50.peerCount = calculateAverage([...peerCount], 0.5);
  percentiles.p95.peerCount = calculateAverage([...peerCount], 0.95);

  // @TODO Calculate average activeDifficulty

  return percentiles;
};

const calculateAverage = (values, percentile) => {
  values.length = Math.ceil(values.length * percentile);

  return parseInt(
    values.reduce((a, b) => Number(a) + Number(b), 0) / values.length,
  );
};

// Once every 15 minutes
// https://crontab.guru/#*/15_*_*_*_*
cron.schedule("*/15 * * * *", async () => {
  if (process.env.NODE_ENV !== "production") return;

  doTelemetryCron();
});

if (process.env.NODE_ENV === "production") {
  doTelemetryCron();
}
