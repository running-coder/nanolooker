const { nodeCache } = require("../client/cache");
const { REPRESENTATIVE, EXPIRE_7D } = require("../constants");
const { rpc } = require("../rpc");
const { Sentry } = require("../sentry");

const getRepresentative = account => {
  let representative = {};
  if (!account) return representative;

  representative = (nodeCache.get(REPRESENTATIVE) || {})[account];

  return representative || {};
};

const getAllRepresentatives = () => {
  return nodeCache.get(REPRESENTATIVE);
};

const setRepresentatives = async ({ metrics, peers }) => {
  const representatives = {};

  try {
    const response = await rpc("version");
    const [, major, minor, patch = 0] = /(\d+).(\d+)(\.\d+)?/.exec(response.node_vendor);
    const version = parseInt(`${major}${minor}${patch}`);

    peers
      .map(peer => {
        const metric = metrics.find(
          ({ address }) => address && peer.ip && address.includes(peer.ip),
        );

        if (metric) {
          const {
            major_version: majorVersion,
            minor_version: minorVersion,
            patch_version: patchVersion,
          } = metric;

          metric.version = `${majorVersion}.${minorVersion}.${patchVersion}`;
          metric.isLatestVersion =
            parseInt(`${majorVersion}${minorVersion}${patchVersion}`) >= parseInt(version);
        }

        representatives[peer.account] = metric;

        return false;
      })
      .filter(Boolean);
  } catch (err) {
    Sentry.captureException(err);
  }

  nodeCache.set(REPRESENTATIVE, representatives, EXPIRE_7D);
};

module.exports = {
  getRepresentative,
  setRepresentatives,
  getAllRepresentatives,
};
