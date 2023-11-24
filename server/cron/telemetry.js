const cron = require("node-cron");
const { rpc } = require("../rpc");
const { nodeCache } = require("../client/cache");
const { Sentry } = require("../sentry");
const { TELEMETRY } = require("../constants");
const { getConfirmationQuorumPeers } = require("./nodeMonitors");
const { setRepresentatives } = require("../api/representative");

const BASE_DIFFICULTY = 0xfffffff800000000;

const getMultiplierFromBaseDifficulty = difficulty =>
  (2 ** 64 - BASE_DIFFICULTY) / (2 ** 64 - parseInt(difficulty, 16));

const doTelemetryCron = async () => {
  try {
    const { metrics } = await rpc("telemetry", {
      raw: true,
    });
    const peers = await getConfirmationQuorumPeers();

    // Record representative node version for account page
    setRepresentatives({ metrics, peers });

    if (!metrics || !peers) return;

    const percentiles = calculatePercentiles(metrics, peers);

    nodeCache.set(TELEMETRY, percentiles);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

const calculatePercentiles = (metrics, peers) => {
  const blockCount = [];
  const cementedCount = [];
  const uncheckedCount = [];
  const accountCount = [];
  const bandwidthCap = [];
  const peerCount = [];
  const uptime = [];
  let activeDifficulty = [];

  const percentiles = {
    p5: {},
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

    const { major_version: major, minor_version: minor, patch_version: patch } = metric;
    const version = `${major}.${minor}.${patch}`;

    const metricsRawIp = `[${metric.address}]:${metric.port}`;

    const { weight = 0 } = peers.find(({ rawIp }) => metricsRawIp === rawIp) || {};

    if (!versions[version]) {
      versions[version] = { weight, count: 1 };
    } else {
      versions[version].weight += weight;
      versions[version].count += 1;
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

  const highestBandwidthCapGroup = Object.keys(bandwidthCapGroups).reduce(function (a, b) {
    return bandwidthCapGroups[a] > bandwidthCapGroups[b] ? a : b;
  });

  status.bandwidthCapGroups.push({
    count: bandwidthCapGroups[highestBandwidthCapGroup],
    bandwidthCap: parseInt(highestBandwidthCapGroup),
  });

  percentiles.p5.blockCount = calculateAverage([...blockCount], 0.05);
  percentiles.p50.blockCount = calculateAverage([...blockCount], 0.5);
  percentiles.p95.blockCount = calculateAverage([...blockCount], 0.95);
  percentiles.p100.blockCount = calculateAverage([...blockCount], 1);

  percentiles.p5.cementedCount = calculateAverage([...cementedCount], 0.05);
  percentiles.p50.cementedCount = calculateAverage([...cementedCount], 0.5);
  percentiles.p95.cementedCount = calculateAverage([...cementedCount], 0.95);
  percentiles.p100.cementedCount = calculateAverage([...cementedCount], 1);

  percentiles.p5.uncheckedCount = calculateAverage([...uncheckedCount], 0.05);
  percentiles.p50.uncheckedCount = calculateAverage([...uncheckedCount], 0.5);
  percentiles.p95.uncheckedCount = calculateAverage([...uncheckedCount], 0.95);
  percentiles.p100.uncheckedCount = calculateAverage([...uncheckedCount], 1);

  percentiles.p5.accountCount = calculateAverage([...accountCount], 0.05);
  percentiles.p50.accountCount = calculateAverage([...accountCount], 0.5);
  percentiles.p95.accountCount = calculateAverage([...accountCount], 0.95);
  percentiles.p100.accountCount = calculateAverage([...accountCount], 1);

  percentiles.p5.bandwidthCap =
    (status.bandwidthCapGroups[0].count * 100) / status.bandwidthCapGroups[1].count < 50
      ? status.bandwidthCapGroups[0].bandwidthCap
      : status.bandwidthCapGroups[1].bandwidthCap;

  percentiles.p50.bandwidthCap =
    (status.bandwidthCapGroups[0].count * 100) / status.bandwidthCapGroups[1].count >= 50
      ? status.bandwidthCapGroups[0].bandwidthCap
      : status.bandwidthCapGroups[1].bandwidthCap;

  percentiles.p95.bandwidthCap = percentiles.p50.bandwidthCap;
  percentiles.p100.bandwidthCap = percentiles.p50.bandwidthCap;

  percentiles.p5.peerCount = calculateAverage([...peerCount], 0.05);
  percentiles.p50.peerCount = calculateAverage([...peerCount], 0.5);
  percentiles.p95.peerCount = calculateAverage([...peerCount], 0.95);
  percentiles.p100.peerCount = calculateAverage([...peerCount], 1);

  percentiles.p5.uptime = calculateAverage([...uptime], 0.05);
  percentiles.p50.uptime = calculateAverage([...uptime], 0.5);
  percentiles.p95.uptime = calculateAverage([...uptime], 0.95);
  percentiles.p100.uptime = calculateAverage([...uptime], 1);

  return { telemetry: percentiles, versions, status };
};

const calculateAverage = (values, percentile) => {
  values.length = Math.ceil(values.length * percentile);

  const sample = values.reduce((a, b) => Number(a) + Number(b), 0);
  const median = sample / values.length;

  return parseInt(median);
};

// Once every 10 minutes
// https://crontab.guru/#*/10_*_*_*_*
cron.schedule("*/10 * * * *", async () => {
  if (process.env.NODE_ENV !== "production") return;

  doTelemetryCron();
});

if (process.env.NODE_ENV === "production") {
  doTelemetryCron();
}
