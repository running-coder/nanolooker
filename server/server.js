require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { rpc, allowedRpcMethods } = require("./rpc");
const bodyParser = require("body-parser");
const path = require("path");

const {
  wsCache,
  TOTAL_CONFIRMATION_KEY_24H,
  TOTAL_NANO_VOLUME_KEY_24H,
  TOTAL_CONFIRMATION_KEY_48H,
  TOTAL_NANO_VOLUME_KEY_48H
} = require("./ws");
const {
  getBtcTransactionFees,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H
} = require("./api/btcTransactionFees");
const {
  DEVELOPER_FUND_TRANSACTIONS,
  getDeveloperFundTransactions
} = require("./api/developerFundTransactions");
const { NODE_STATUS, getNodeStatus } = require("./api/nodeStatus");

const app = express();

app.use(
  cors({
    origin: true
  })
);

app.use(bodyParser.json());

app.post("/api/rpc", async (req, res) => {
  const { action, ...params } = req.body || {};

  if (!action) {
    return res.status(422).send("Missing action");
  } else if (!allowedRpcMethods.includes(action)) {
    return res.status(422).send("RPC action not allowed");
  }

  const result = await rpc(action, params);

  return res.send(result);
});

app.get("/api/developer-fund/transactions", async (req, res) => {
  const { developerFundTransactions } = await getDeveloperFundTransactions();

  return res.send(developerFundTransactions);
});

app.get("/api/statistics", async (req, res) => {
  const cachedConfirmations24h = wsCache.get(TOTAL_CONFIRMATION_KEY_24H);
  const cachedVolume24h = wsCache.get(TOTAL_NANO_VOLUME_KEY_24H);
  const cachedConfirmations48h = wsCache.get(TOTAL_CONFIRMATION_KEY_48H);
  const cachedVolume48h = wsCache.get(TOTAL_NANO_VOLUME_KEY_48H);
  const {
    btcTransactionFees24h,
    btcTransactionFees48h
  } = await getBtcTransactionFees();

  return res.send({
    [TOTAL_CONFIRMATION_KEY_24H]: cachedConfirmations24h,
    [TOTAL_NANO_VOLUME_KEY_24H]: cachedVolume24h,
    [TOTAL_CONFIRMATION_KEY_48H]: cachedConfirmations48h,
    [TOTAL_NANO_VOLUME_KEY_48H]: cachedVolume48h,
    [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H]: btcTransactionFees24h,
    [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H]: btcTransactionFees48h
  });
});

app.get("/api/node-status", async (req, res) => {
  const { nodeStatus } = await getNodeStatus();

  return res.send(nodeStatus);
});

app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res, next) => {
  if (/^\/ws/.test(req.url) || /^\/api\//.test(req.url)) {
    next();
  } else {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  }
});

app.listen(process.env.SERVER_PORT);

console.log(`Server started on http://localhost:${process.env.SERVER_PORT}`);
