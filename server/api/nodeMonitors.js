const { nodeCache } = require("../cache");
const { NODE_MONITORS } = require("../constants");

const getNodeMonitors = () => {
  return nodeCache.get(NODE_MONITORS) || [];
};

module.exports = {
  getNodeMonitors,
};
