const cron = require("node-cron");
const fetch = require("node-fetch");
const { rpc } = require("../rpc");
const { nodeCache } = require("../client/cache");
const { Sentry } = require("../sentry");
const { rawToRai } = require("../utils");
const { NODE_MONITORS } = require("../constants");
const monitorAliases = require("./monitorAliases.json");

const NODE_IP_REGEX = /\[::ffff:([\d.]+)\]:[\d]+/;

// Get Representative peers (participating in the quorum)
const getConfirmationQuorumPeers = async () => {
  let peers;
  try {
    const { peers: rawPeers, principal_representative_min_weight } = await rpc(
      "confirmation_quorum",
      {
        peer_details: true,
      },
    );

    peers = rawPeers.map(({ account, ip: rawIp, weight: rawWeight }) => {
      const [, ip] = rawIp.match(NODE_IP_REGEX);
      const weight = rawToRai(rawWeight);
      return {
        account,
        rawIp,
        ip,
        weight,
        isPrincipal: weight >= principal_representative_min_weight,
      };
    });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return peers;
};

const getNodeMonitor = async (ip, protocol = "http") => {
  try {
    const url = `${protocol}://${ip}`;
    const res = await fetch(`${url}/api.php`, { timeout: 7500 });

    const {
      version,
      store_vendor: storeVersion,
      nodeMonitorVersion,
      currentBlock,
      uncheckedBlocks,
      cementedBlocks,
      numPeers,
      systemLoad,
      systemUptime,
      usedMem,
      totalMem,
      nanoNodeName,
      nodeUptimeStartup,
      nodeLocation,
      active_difficulty: { multiplier },
      blockSync,
    } = await res.json();

    return {
      url,
      version,
      storeVersion,
      nodeMonitorVersion,
      currentBlock,
      uncheckedBlocks,
      cementedBlocks,
      numPeers,
      systemLoad,
      systemUptime,
      usedMem,
      totalMem,
      nanoNodeName,
      nodeUptimeStartup,
      nodeLocation,
      active_difficulty: {
        multiplier,
      },
      blockSync,
    };
  } catch (err) {
    console.log(`${ip} has no monitor on ${protocol}`);
  }

  return {};
};

const doNodeMonitors = async () => {
  console.log("Starting doPeersCron");
  try {
    let peers = await getConfirmationQuorumPeers();

    // Store the nodes without monitor for 24h so the 5 minutes request doesn't pull them
    let skipMonitorCheck24h = nodeCache.get(`${NODE_MONITORS}_NO_MONITOR`) || [];

    peers = peers.filter(({ ip }) => {
      return !skipMonitorCheck24h.includes(ip);
    });

    let results = await Promise.all(
      peers.map(async ({ account, ip, ...rest }) => {
        const domain = monitorAliases[account] || ip;

        let monitor = await getNodeMonitor(domain, "https");

        if (!Object.keys(monitor).length) {
          monitor = await getNodeMonitor(domain);
        }

        if (!Object.keys(monitor).length) {
          skipMonitorCheck24h.push(ip);
        }

        return {
          account,
          ip,
          ...rest,
          monitor,
        };
      }),
    );

    results = results.filter(Boolean);

    nodeCache.set(`${NODE_MONITORS}_NO_MONITOR`, skipMonitorCheck24h);
    nodeCache.set(NODE_MONITORS, results);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

// https://crontab.guru/#*/10_*_*_*_*
// “At every 10th minute.”
cron.schedule("*/10 * * * *", () => {
  if (process.env.NODE_ENV !== "production") return;

  doNodeMonitors();
});

// https://crontab.guru/#*/0_0_*_*_*
// “At midnight.”
cron.schedule("0 0 * * *", () => {
  nodeCache.del(`${NODE_MONITORS}_NO_MONITOR`);
});

if (process.env.NODE_ENV === "production") {
  doNodeMonitors();
}

module.exports = {
  getConfirmationQuorumPeers,
};
