const fetch = require("node-fetch");

const serverAddress = `http://${process.env.NANO_RPC_IP}:${process.env.NANO_RPC_PORT}`;

const allowedRpcMethods = [
  "block_count",
  "active_difficulty",
  "uptime",
  "peers",
  "version",
  "available_supply",
  "frontier_count"
];

const rpc = async (action, params) => {
  let res;
  let json;

  try {
    res = await fetch(serverAddress, {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        action,
        ...params
      })
    });

    json = await res.json();
  } catch (e) {
    console.log(e);
  }

  return json;
};

exports.rpc = rpc;
exports.allowedRpcMethods = allowedRpcMethods;
