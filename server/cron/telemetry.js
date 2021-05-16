const cron = require("node-cron");
const { rpc } = require("../rpc");
const { nodeCache } = require("../cache");
const { Sentry } = require("../sentry");
const { TELEMETRY } = require("../constants");

const BASE_DIFFICULTY = 0xfffffff800000000;

const getMultiplierFromBaseDifficulty = difficulty =>
  (2 ** 64 - BASE_DIFFICULTY) / (2 ** 64 - parseInt(difficulty, 16));

const doTelemetryCron = async () => {
  try {
    const { metrics } = await rpc("telemetry", {
      raw: true,
    });

    const percentiles = calculatePercentiles(metrics);

    nodeCache.set(TELEMETRY, percentiles);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

const calculatePercentiles = metrics => {
  const blockCount = [];
  const cementedCount = [];
  const uncheckedCount = [];
  const accountCount = [];
  const bandwidthCap = [];
  const peerCount = [];
  const uptime = [];
  let activeDifficulty = [];

  const percentiles = {
    p50: {},
    p95: {},
    p100: {},
  };

  const versions = {};

  const status = {
    nodeCount: metrics.length,
    date: Date.now(),
    bandwidthCapGroups: [
      {
        count: 0,
        bandwidthCap: 0,
      },
    ],
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

    const {
      major_version: major,
      minor_version: minor,
      patch_version: patch,
    } = metric;
    const version = `${major}.${minor}.${patch}`;
    if (!versions[version]) {
      versions[version] = 1;
    } else {
      versions[version] += 1;
    }
  });

  activeDifficulty = activeDifficulty.map(difficulty =>
    getMultiplierFromBaseDifficulty(difficulty),
  );

  blockCount.sort((a, b) => b - a);
  cementedCount.sort((a, b) => b - a);
  uncheckedCount.sort((a, b) => b - a);
  accountCount.sort((a, b) => b - a);
  bandwidthCap.sort((a, b) => a - b);
  peerCount.sort((a, b) => b - a);
  uptime.sort((a, b) => b - a);
  activeDifficulty.sort((a, b) => a - b);

  // Get highest bandwidthCap group
  const bandwidthCapGroups = bandwidthCap.reduce((groups, bandwidthCap) => {
    if (bandwidthCap === "0") {
      status.bandwidthCapGroups[0].count += 1;
    } else if (!groups[bandwidthCap]) {
      groups[bandwidthCap] = 1;
    } else {
      groups[bandwidthCap] += 1;
    }
    return groups;
  }, {});

  const highestBandwidthCapGroup = Object.keys(bandwidthCapGroups).reduce(
    function (a, b) {
      return bandwidthCapGroups[a] > bandwidthCapGroups[b] ? a : b;
    },
  );

  status.bandwidthCapGroups.push({
    count: bandwidthCapGroups[highestBandwidthCapGroup],
    bandwidthCap: parseInt(highestBandwidthCapGroup),
  });

  percentiles.p50.blockCount = calculateAverage([...blockCount], 0.5);
  percentiles.p95.blockCount = calculateAverage([...blockCount], 0.95);
  percentiles.p100.blockCount = calculateAverage([...blockCount], 1);

  percentiles.p50.cementedCount = calculateAverage([...cementedCount], 0.5);
  percentiles.p95.cementedCount = calculateAverage([...cementedCount], 0.95);
  percentiles.p100.cementedCount = calculateAverage([...cementedCount], 1);

  percentiles.p50.uncheckedCount = calculateAverage([...uncheckedCount], 0.5);
  percentiles.p95.uncheckedCount = calculateAverage([...uncheckedCount], 0.95);
  percentiles.p100.uncheckedCount = calculateAverage([...uncheckedCount], 1);

  percentiles.p50.accountCount = calculateAverage([...accountCount], 0.5);
  percentiles.p95.accountCount = calculateAverage([...accountCount], 0.95);
  percentiles.p100.accountCount = calculateAverage([...accountCount], 1);

  percentiles.p50.bandwidthCap = calculateAverage(
    [...bandwidthCap],
    0.5,
    false,
  );
  percentiles.p95.bandwidthCap = calculateAverage(
    [...bandwidthCap],
    0.95,
    false,
  );
  percentiles.p100.bandwidthCap = calculateAverage([...bandwidthCap], 1, false);

  percentiles.p50.peerCount = calculateAverage([...peerCount], 0.5);
  percentiles.p95.peerCount = calculateAverage([...peerCount], 0.95);
  percentiles.p100.peerCount = calculateAverage([...peerCount], 1);

  percentiles.p50.uptime = calculateAverage([...uptime], 0.5);
  percentiles.p95.uptime = calculateAverage([...uptime], 0.95);
  percentiles.p100.uptime = calculateAverage([...uptime], 1);

  percentiles.p50.activeDifficulty = calculateAverage(
    [...activeDifficulty],
    0.5,
    false,
  );
  percentiles.p95.activeDifficulty = calculateAverage(
    [...activeDifficulty],
    0.95,
    false,
  );
  percentiles.p100.activeDifficulty = calculateAverage(
    [...activeDifficulty],
    1,
    false,
  );

  return { telemetry: percentiles, versions, status };
};

const calculateAverage = (values, percentile, isInt = true) => {
  values.length = Math.ceil(values.length * percentile);

  const sample = values.reduce((a, b) => Number(a) + Number(b), 0);
  const median = sample / values.length;

  return isInt ? parseInt(median) : parseFloat(median);
};

// Once every 10 minutes
// https://crontab.guru/#*/10_*_*_*_*
cron.schedule("*/10 * * * *", async () => {
  if (process.env.NODE_ENV !== "production") return;

  doTelemetryCron();
});

// if (process.env.NODE_ENV === "production") {
doTelemetryCron();
// }
