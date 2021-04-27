const { nodeCache } = require("../cache");
const { NETWORK_STATUS } = require("../constants");

const getNetworkStatus = () => {
  return nodeCache.get(NETWORK_STATUS) || {};
};

module.exports = {
  getNetworkStatus,
};
