const { nodeCache } = require("../client/cache");
const { TELEMETRY } = require("../constants");

const getTelemetry = () => {
  return nodeCache.get(TELEMETRY) || { telemetry: {}, status: {} };
};

module.exports = {
  getTelemetry,
};
