const { nodeCache } = require("../cache");
const { DELEGATED_ENTITY } = require("../constants");

const getDelegatedEntity = async () => {
  return nodeCache.get(DELEGATED_ENTITY) || [];
};

module.exports = {
  getDelegatedEntity,
};
