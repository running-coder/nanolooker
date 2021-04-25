const fs = require("fs");
const os = require("os");
const find = require("find-process");
const pidusage = require("pidusage");
const NodeCache = require("node-cache");
const { Sentry } = require("../sentry");
const { NODE_STATUS } = require("../constants");

const apiCache = new NodeCache({
  stdTTL: 30,
  deleteOnExpire: true,
});

const getNodeStatus = async () => {
  let nodeStatus = apiCache.get(NODE_STATUS);

  if (!nodeStatus) {
    try {
      const [{ pid }] = await find("name", "nano_node");
      const { cpu, memory, elapsed } = await pidusage(pid);
      const { size: ledgerSize } = fs.statSync(
        `${process.env.NANO_FOLDER}/data.ldb`,
      );

      nodeStatus = {
        memory: {
          free: os.freemem(),
          total: os.totalmem(),
        },
        ledgerSize,
        nodeStats: {
          cpu,
          memory,
          elapsed,
        },
      };

      apiCache.set(NODE_STATUS, nodeStatus);
    } catch (err) {
      console.log("Error", err);
      Sentry.captureException(err);
    }
  }

  return { nodeStatus };
};

module.exports = {
  getNodeStatus,
  NODE_STATUS,
};
