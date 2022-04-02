const { nodeCache } = require("../client/cache");
const { REPRESENTATIVE, EXPIRE_1W } = require("../constants");
const { rpc } = require("../rpc");
const { Sentry } = require("../sentry");

const getRepresentative = account => {
  let representative = {};
  if (!account) return representative;

  representative = (nodeCache.get(REPRESENTATIVE) || {})[account];

  return representative || {};
};

const setRepresentatives = async ({ metrics, peers }) => {
  const representatives = {};

  try {
    const { node_vendor } = await rpc("version");
    const version = parseInt(node_vendor.replace(/[^\d.]/g, ""));

    peers
      .map(peer => {
        const metric = metrics.find(
          ({ address }) => address && peer.ip && address.includes(peer.ip),
        );

        if (metric) {
          const {
            major_version: major,
            minor_version: minor,
            patch_version: patch,
          } = metric;

          metric.version = `${major}.${minor}.${patch}`;
          metric.isLatestVersion = parseInt(major) >= version;
        }

        representatives[peer.account] = metric;

        return false;
      })
      .filter(Boolean);
  } catch (err) {
    Sentry.captureException(err);
  }

  nodeCache.set(REPRESENTATIVE, representatives, EXPIRE_1W);
};

module.exports = {
  getRepresentative,
  setRepresentatives,
};
