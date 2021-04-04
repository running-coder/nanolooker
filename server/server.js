require("dotenv").config();
require("./cron/ws");
require("./cron/marketCapRank");
const { getDistributionData } = require("./cron/distribution");
const { getDelegatorsData } = require("./cron/delegators");
require("./ws");
const { getExchangeBalances } = require("./cron/exchangeTracker");
const express = require("express");
const cors = require("cors");
const { rpc, allowedRpcMethods } = require("./rpc");
const bodyParser = require("body-parser");
const path = require("path");

const {
  TOTAL_CONFIRMATIONS_KEY_24H,
  TOTAL_NANO_VOLUME_KEY_24H,
  TOTAL_CONFIRMATIONS_KEY_48H,
  TOTAL_NANO_VOLUME_KEY_48H,
  CONFIRMATIONS_PER_SECOND,
} = require("./constants");
const { wsCache } = require("./ws/cache");
const {
  getBtcTransactionFees,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H,
  TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H,
} = require("./api/btcTransactionFees");

const { getCoingeckoStats } = require("./api/coingeckoStats");
const {
  getDeveloperFundTransactions,
} = require("./api/developerFundTransactions");
const { getLargeTransactions } = require("./api/largeTransactions");
const { getNodeStatus } = require("./api/nodeStatus");
const { getKnownAccounts } = require("./api/knownAccounts");

const app = express();

app.use(
  cors({
    origin: true,
  }),
);

app.use(bodyParser.json());

app.post("/api/rpc", async (req, res) => {
  const { action, ...params } = req.body || {};

  if (!action) {
    return res.status(422).send("Missing action");
  } else if (!allowedRpcMethods.includes(action)) {
    return res.status(422).send("RPC action not allowed");
  }

  const result = await rpc(action, params, true);

  return res.send(result);
});

app.get("/api/confirmations-per-second", (req, res) => {
  return res.send({ cps: wsCache.get(CONFIRMATIONS_PER_SECOND) });
});

app.get("/api/distribution", (req, res) => {
  const data = getDistributionData();

  return res.send(data);
});

app.get("/api/delegators", (req, res) => {
  const data = getDelegatorsData();

  return res.send(data);
});

app.get("/api/large-transactions", async (req, res) => {
  const { largeTransactions } = await getLargeTransactions();

  return res.send(largeTransactions);
});

app.get("/api/exchange-tracker", async (req, res) => {
  const exchangeBalances = await getExchangeBalances();

  return res.send(exchangeBalances);
});

app.get("/api/developer-fund/transactions", async (req, res) => {
  const { developerFundTransactions } = await getDeveloperFundTransactions();

  return res.send(developerFundTransactions);
});

app.get("/api/market-statistics", async (req, res) => {
  const cachedConfirmations24h = wsCache.get(TOTAL_CONFIRMATIONS_KEY_24H);
  const cachedVolume24h = wsCache.get(TOTAL_NANO_VOLUME_KEY_24H);
  const cachedConfirmations48h = wsCache.get(TOTAL_CONFIRMATIONS_KEY_48H);
  const cachedVolume48h = wsCache.get(TOTAL_NANO_VOLUME_KEY_48H);

  const {
    btcTransactionFees24h,
    btcTransactionFees48h,
  } = await getBtcTransactionFees();
  const { marketStats, priceStats } = await getCoingeckoStats({
    fiat: req.query.fiat,
  });

  return res.send({
    [TOTAL_CONFIRMATIONS_KEY_24H]: cachedConfirmations24h,
    [TOTAL_NANO_VOLUME_KEY_24H]: cachedVolume24h,
    [TOTAL_CONFIRMATIONS_KEY_48H]: cachedConfirmations48h,
    [TOTAL_NANO_VOLUME_KEY_48H]: cachedVolume48h,
    [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_24H]: btcTransactionFees24h,
    [TOTAL_BITCOIN_TRANSACTION_FEES_KEY_48H]: btcTransactionFees48h,
    ...marketStats,
    priceStats,
  });
});

app.get("/api/known-accounts", async (req, res) => {
  const { knownAccounts } = await getKnownAccounts();

  return res.send(knownAccounts);
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
