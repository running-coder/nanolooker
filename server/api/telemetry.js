const { nodeCache } = require("../cache");
const { TELEMETRY } = require("../constants");

const getTelemetry = () => {
  return nodeCache.get(TELEMETRY) || {};
};

module.exports = {
  getTelemetry,
};
