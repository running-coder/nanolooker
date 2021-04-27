const cron = require("node-cron");
const fetch = require("node-fetch");
const { rpc } = require("../rpc");
const { nodeCache } = require("../cache");
const { Sentry } = require("../sentry");
const { NETWORK_STATUS, EXPIRE_24H } = require("../constants");
const monitorAliases = require("./monitorAliases.json");

const PEER_IP_REGEX = /\[::ffff:([\d.]+)\]:[\d]+/;

const getPeers = async () => {
  let peers;
  try {
    const { peers: rawPeers } = await rpc("confirmation_quorum", {
      peer_details: true,
    });

    peers = rawPeers.map(({ account, ip: rawIp }) => {
      const [, ip] = rawIp.match(PEER_IP_REGEX);
      return {
        account,
        ip,
      };
    });
  } catch (err) {
    Sentry.captureException(err);
  }

  return peers;
};

const getPeerMonitor = async (ip, protocol = "http") => {
  try {
    const res = await fetch(`${protocol}://${ip}/api.php`, { timeout: 5000 });

    const {
      version,
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
      version,
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

const doNetworkStatusCron = async () => {
  console.log("Starting doPeersCron");
  try {
    let peers = await getPeers();

    // Store the nodes without monitor for 24h so the 5 minutes request doesn't pull them
    let skipMonitorCheck24h =
      nodeCache.get(`${NETWORK_STATUS}_NO_MONITOR`) || [];

    peers = peers.filter(({ account, ip: rawIp }) => {
      const ip = monitorAliases[account] || rawIp;

      return !skipMonitorCheck24h.includes(ip);
    });

    let results = await Promise.all(
      peers.map(async ({ account, ip: rawIp }) => {
        const ip = monitorAliases[account] || rawIp;

        let monitor = await getPeerMonitor(ip);

        if (!Object.keys(monitor).length) {
          monitor = await getPeerMonitor(ip, "https");
        }

        if (!Object.keys(monitor).length) {
          skipMonitorCheck24h.push(ip);
          return;
        }

        return {
          account,
          ip,
          monitor,
        };
      }),
    );

    results = results.filter(Boolean);

    nodeCache.set(
      `${NETWORK_STATUS}_NO_MONITOR`,
      skipMonitorCheck24h,
      EXPIRE_24H,
    );
    nodeCache.set(NETWORK_STATUS, results);
  } catch (err) {
    Sentry.captureException(err);
  }
};

// https://crontab.guru/#*/10_*_*_*_*
// “At every 10th minute.”
cron.schedule("*/10 * * * *", () => {
  if (process.env.NODE_ENV !== "production") return;

  doNetworkStatusCron();
});

if (process.env.NODE_ENV === "production") {
  doNetworkStatusCron();
}

module.exports = {
  getPeers,
};
