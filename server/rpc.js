const fetch = require("node-fetch");

const allowedRpcMethods = [
  "block_count",
  "active_difficulty",
  "uptime",
  "peers",
  "version",
  "available_supply",
  "frontier_count",
  // "confirmation_quorum", // @NOTE experiment w/
  "account_info",
  "account_history",
  "block_info"
];

const rpc = async (action, params) => {
  let res;
  let json;

  try {
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
  } catch (e) {
    console.log(e);
  }

  return json;
};

exports.rpc = rpc;
exports.allowedRpcMethods = allowedRpcMethods;
