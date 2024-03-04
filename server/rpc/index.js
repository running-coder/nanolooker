const fetch = require("node-fetch");
const { transformer: confirmation_quorum } = require("./transformers/confirmationQuorum");
const { transformer: representatives } = require("./transformers/representatives");
const { nodeCache } = require("../client/cache");
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
//@Note more cache due to 26.1
const cacheSettings = {
  account_history: 1000,
  account_info: 1000,
  account_representative: 3600,
  accounts_balances: 100,
  active_difficulty: 100,
  available_supply: 3600 * 10,
  block_count: 100,
  block_info: 100,
  blocks_info: 500,
  confirmation_history: 500,
  confirmation_quorum: 500,
  frontier_count: 500,
  peers: 3600,
  pending: 500,
  representatives: 3600 * 4,
  representatives_online: 3600 * 4,
  stats: 500,
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

const rpc = async (action, params, isLimited, rpcDomain) => {
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

      res = await fetch(rpcDomain || process.env.RPC_DOMAIN, {
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
    // @NOTE now that RPC is changeable, don't always capture errors
    if (!rpcDomain) {
      console.log("Error", err);
      Sentry.captureException(err);
    }
  }

  return json;
};

exports.rpc = rpc;
exports.allowedRpcMethods = allowedRpcMethods;
