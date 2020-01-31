const fetch = require("node-fetch");
const NodeCache = require("node-cache");

const rpcCache = new NodeCache();

const allowedRpcMethods = [
  "block_count",
  "active_difficulty",
  "uptime",
  "peers",
  "version",
  "available_supply",
  "frontier_count",
  "account_info",
  "account_history",
  "block_info",
  "representatives",
  "representatives_online",
  "confirmation_quorum"
];

const cacheSettings = {
  block_count: 5,
  active_difficulty: 10,
  uptime: 120,
  peers: undefined,
  version: 3600,
  available_supply: 604800,
  frontier_count: undefined,
  account_info: 5,
  account_history: 5,
  block_info: undefined,
  representatives: undefined,
  representatives_online: undefined,
  confirmation_quorum: 60
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
        ...params
      });

      res = await fetch(process.env.RPC_DOMAIN, {
        method: "POST",
        body
      });

      json = await res.json();

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
