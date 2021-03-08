const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const {
  transformer: confirmation_quorum,
} = require("./transformers/confirmationQuorum");
const {
  transformer: representatives,
} = require("./transformers/representatives");

const rpcCache = new NodeCache();

const transformers = {
  confirmation_quorum,
  representatives,
};

const allowedRpcMethods = [
  "account_history",
  "account_info",
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
  account_history: undefined,
  account_info: 5,
  accounts_balances: 30,
  active_difficulty: 10,
  available_supply: 604800,
  block_count: 5,
  block_info: 120,
  blocks_info: 120,
  confirmation_history: 3600,
  confirmation_quorum: 60,
  frontier_count: undefined,
  peers: undefined,
  pending: 5,
  representatives: 120,
  representatives_online: 120,
  stats: 5,
  uptime: 120,
  version: 3600,
};

const getCacheKey = (action, params) =>
  `${action}${
    Object.keys(params).length ? `-${Object.values(params).join("-")}` : ""
  }`;

const rpc = async (action, params) => {
  let res;
  let json;
  let cacheKey = cacheSettings[action] && getCacheKey(action, params);

  try {
    json = cacheKey && rpcCache.get(cacheKey);

    if (!json) {
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
        rpcCache.set(cacheKey, json, cacheSettings[action]);
      }
    } else {
      console.log(`Cache found for: ${cacheKey}`);
    }
  } catch (e) {
    console.log(e);
  }

  return json;
};

exports.rpc = rpc;
exports.rpcCache = rpcCache;
exports.allowedRpcMethods = allowedRpcMethods;
