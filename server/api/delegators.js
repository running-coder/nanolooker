const fs = require("fs");
const { join } = require("path");
const { nodeCache } = require("../client/cache");
const { EXPIRE_1W, DELEGATORS } = require("../constants");

const ROOT_FOLDER = join(__dirname, "../data/");
const DELEGATORS_FOLDER = join(__dirname, "../data/delegators/");
const DELEGATORS_PATH = join(ROOT_FOLDER, "delegators.json");

const getDelegators = ({ account }) => {
  const delegatorsKey = `${DELEGATORS}-${account}`;
  let delegators = nodeCache.get(delegatorsKey);

  if (!delegators) {
    const accountDelegatorsPath = join(DELEGATORS_FOLDER, `${account}.json`);
    delegators = fs.existsSync(accountDelegatorsPath)
      ? JSON.parse(fs.readFileSync(accountDelegatorsPath, "utf8"))
      : [];
    nodeCache.set(delegatorsKey, delegators, EXPIRE_1W);
  }

  return delegators;
};

const getAllDelegators = () => {
  let delegators = nodeCache.get(DELEGATORS);

  if (!delegators) {
    delegators = fs.existsSync(DELEGATORS_PATH)
      ? JSON.parse(fs.readFileSync(DELEGATORS_PATH, "utf8"))
      : [];
    nodeCache.set(DELEGATORS, delegators, EXPIRE_1W);
  }

  return delegators;
};

module.exports = {
  getDelegators,
  getAllDelegators,
};
