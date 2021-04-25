const NodeCache = require("node-cache");
const { NETWORK_STATUS } = require("../constants");

const networkStatusCache = new NodeCache();

const getNetworkStatus = () => {
  return networkStatusCache.get(NETWORK_STATUS) || {};
};

module.exports = {
  networkStatusCache,
  getNetworkStatus,
};
