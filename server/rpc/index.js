const fetch = require("node-fetch");
const {
  transformer: confirmation_quorum,
} = require("./transformers/confirmationQuorum");
const {
  transformer: representatives,
} = require("./transformers/representatives");
const { nodeCache } = require("../cache");
const { Sentry } = require("../sentry");

const transformers = {
  confirmation_quorum,
  representatives,
};

const allowedRpcMethods = [
  "account_history",
  "account_info",
  "account_representative",
  "accounts_balances",
  "active_difficulty",
  "available_supply",
  "block_count",
  "block_info",
  "blocks_info",
  "confirmation_history",
  "confirmation_quorum",
  "frontier_count",
  "peers",
  "pending",
  "representatives",
  "representatives_online",
  "stats",
  "uptime",
  "version",
];

const cacheSettings = {
  account_history: 5,
  account_info: 5,
  account_representative: 60,
  accounts_balances: 5,
  active_difficulty: 5,
  available_supply: 604800,
  block_count: 5,
  block_info: 5,
  blocks_info: 5,
  confirmation_history: 30,
  confirmation_quorum: 30,
  frontier_count: 5,
  peers: 10,
  pending: 5,
  representatives: 30,
  representatives_online: 30,
  stats: 5,
  uptime: 30,
  version: 30,
};

const limits = {
  accounts_balances: {
    accounts: 50,
  },
  blocks_info: {
    hashes: 5,
  },
};

const getCacheKey = (action, params) =>
  `${action}${
    params && Object.keys(params).length
      ? `-${Object.values(params).filter(Boolean).join("-")}`
      : ""
  }`;

const rpc = async (action, params, isLimited) => {
  let res;
  let json;
  let cacheKey = cacheSettings[action] && getCacheKey(action, params);

  try {
    json = cacheKey && nodeCache.get(cacheKey);

    if (!json) {
      if (isLimited && limits[action]) {
        for (const key in limits[action]) {
          if (params[key] && params[key].length > limits[action][key]) {
            return { error: `Limit exceeded for "${action}"` };
          }
        }
      }

      const body = JSON.stringify({
        jsonrpc: "2.0",
        action,
        ...params,
      });

      res = await fetch(process.env.RPC_DOMAIN, {
        method: "POST",
        body,
      });

      json = await res.json();

      if (transformers[action]) {
        json = transformers[action](json);
      }

      if (cacheKey) {
        nodeCache.set(cacheKey, json, cacheSettings[action]);
      }
    } else {
      console.log(`Cache found for: ${cacheKey}`);
    }
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return json;
};

exports.rpc = rpc;
exports.allowedRpcMethods = allowedRpcMethods;
