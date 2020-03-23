const fs = require("fs");
const os = require("os");
// const { exec } = require("child_process");
const find = require("find-process");
const pidusage = require("pidusage");
const NodeCache = require("node-cache");

const apiCache = new NodeCache({
  ttl: 30,
  deleteOnExpire: true
});

const NODE_STATUS = "NODE_STATUS";

const getNodeStatus = async () => {
  let nodeStatus = apiCache.get(NODE_STATUS);

  if (!nodeStatus) {
    try {
      //   const pid = await exec("pgrep -f nano_node"); //, (err, stdout) => {});

      const process = find("name", "nano_node");

      console.log("~~~~process", process);
      //   const { cpu, memory, elapsed } = await pidusage(pid);
      //   const { size: ledgerSize } = fs.statSync("/nano/Nano/data.ldb");

      //   nodeStatus = {
      //     memory: {
      //       free: os.freemem(),
      //       total: os.totalmem()
      //     },
      //     ledgerSize,
      //     nodeStats: {
      //       cpu,
      //       memory,
      //       elapsed
      //     }
      //   };

      //   apiCache.set(NODE_STATUS, nodeStatus);
    } catch (err) {
      console.log(err);
    }
  }

  return { nodeStatus };
};

module.exports = {
  getNodeStatus,
  NODE_STATUS
};
