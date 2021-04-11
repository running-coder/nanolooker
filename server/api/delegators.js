const fs = require("fs");
const { join } = require("path");
const NodeCache = require("node-cache");
const { EXPIRE_1W, DELEGATORS } = require("../constants");

const delegatorsCache = new NodeCache({
  stdTTL: EXPIRE_1W,
  deleteOnExpire: true,
});

const ROOT_FOLDER = join(__dirname, "../data/");
const DELEGATORS_FOLDER = join(__dirname, "../data/delegators/");
const DELEGATORS_PATH = join(ROOT_FOLDER, "delegators.json");

const getDelegators = ({ account }) => {
  const delegatorsKey = `${DELEGATORS}-${account}`;
  let delegators = delegatorsCache.get(delegatorsKey);

  if (!delegators) {
    const accountDelegatorsPath = join(DELEGATORS_FOLDER, `${account}.json`);
    delegators = fs.existsSync(accountDelegatorsPath)
      ? JSON.parse(fs.readFileSync(accountDelegatorsPath, "utf8"))
      : [];
    delegatorsCache.set(delegatorsKey, delegators);
  }

  return delegators;
};

const getAllDelegators = () => {
  let delegators = delegatorsCache.get(DELEGATORS);

  if (!delegators) {
    delegators = fs.existsSync(DELEGATORS_PATH)
      ? JSON.parse(fs.readFileSync(DELEGATORS_PATH, "utf8"))
      : [];
    delegatorsCache.set(DELEGATORS, delegators);
  }

  return delegators;
};

module.exports = {
  delegatorsCache,
  getDelegators,
  getAllDelegators,
};
