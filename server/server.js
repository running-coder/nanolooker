require("dotenv").config();
require("./cron/marketCapRank");
require("./cron/knownAccounts");
require("./cron/delegators");
require("./cron/nodeLocations");
require("./cron/nodeMonitors");
require("./cron/telemetry");
require("./cron/ws");
require("./cron/coingeckoStats");
require("./cron/btcTransactionFees");
require("./ws");
const { getDistributionData } = require("./cron/distribution");
const { getExchangeBalances } = require("./cron/exchangeTracker");
const express = require("express");
const cors = require("cors");
const { rpc, allowedRpcMethods } = require("./rpc");
const bodyParser = require("body-parser");
const path = require("path");
const { nodeCache } = require("./cache");
const {
  TOTAL_CONFIRMATIONS_24H,
  TOTAL_VOLUME_24H,
  TOTAL_CONFIRMATIONS_48H,
  TOTAL_VOLUME_48H,
  CONFIRMATIONS_PER_SECOND,
} = require("./constants");
const {
  getBtcTransactionFees,
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
} = require("./api/btcTransactionFees");

const { getCoingeckoStats } = require("./api/coingeckoStats");
const {
  getDeveloperFundTransactions,
} = require("./api/developerFundTransactions");
const { getLargeTransactions } = require("./api/largeTransactions");
const { getNodeStatus } = require("./api/nodeStatus");
const {
  getKnownAccounts,
  getKnownAccountsBalance,
} = require("./api/knownAccounts");
const { getDelegators, getAllDelegators } = require("./api/delegators");
const { getNodeLocations } = require("./api/nodeLocations");
const { getNodeMonitors } = require("./api/nodeMonitors");
const { getDelegatedEntity } = require("./api/delegatedEntity");
const { getTelemetry } = require("./api/telemetry");

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
  return res.send({ cps: nodeCache.get(CONFIRMATIONS_PER_SECOND) });
});

app.get("/api/distribution", (req, res) => {
  const data = getDistributionData();

  return res.send(data);
});

// @TODO ADD getDelegators && getAllDelegators if req.account is specified
app.get("/api/delegators", async (req, res) => {
  let data;
  const { account } = req.query;

  if (account) {
    data = getDelegators({ account });
  } else {
    data = getAllDelegators();
  }

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
  const cachedConfirmations24h = nodeCache.get(TOTAL_CONFIRMATIONS_24H);
  const cachedVolume24h = nodeCache.get(TOTAL_VOLUME_24H);
  const cachedConfirmations48h = nodeCache.get(TOTAL_CONFIRMATIONS_48H);
  const cachedVolume48h = nodeCache.get(TOTAL_VOLUME_48H);

  const {
    btcTransactionFees24h,
    btcTransactionFees48h,
  } = await getBtcTransactionFees();
  const { marketStats, priceStats } = await getCoingeckoStats({
    fiat: req.query.fiat,
    cryptocurrency: req.query.cryptocurrency,
  });

  return res.send({
    [TOTAL_CONFIRMATIONS_24H]: cachedConfirmations24h,
    [TOTAL_VOLUME_24H]: cachedVolume24h,
    [TOTAL_CONFIRMATIONS_48H]: cachedConfirmations48h,
    [TOTAL_VOLUME_48H]: cachedVolume48h,
    [BITCOIN_TOTAL_TRANSACTION_FEES_24H]: btcTransactionFees24h,
    [BITCOIN_TOTAL_TRANSACTION_FEES_48H]: btcTransactionFees48h,
    ...marketStats,
    priceStats,
  });
});

app.get("/api/known-accounts", async (req, res) => {
  const knownAccounts = await getKnownAccounts();

  return res.send(knownAccounts);
});

app.get("/api/known-accounts-balance", async (req, res) => {
  const knownAccountsBalance = await getKnownAccountsBalance();

  return res.send(knownAccountsBalance);
});

app.get("/api/node-status", async (req, res) => {
  const { nodeStatus } = await getNodeStatus();

  return res.send(nodeStatus);
});

app.get("/api/node-monitors", async (req, res) => {
  const nodeMonitors = await getNodeMonitors();

  return res.send(nodeMonitors);
});

app.get("/api/node-locations", async (req, res) => {
  const nodeLocations = await getNodeLocations();

  return res.send(nodeLocations);
});

app.get("/api/delegated-entity", async (req, res) => {
  const delegatedEntity = await getDelegatedEntity();

  return res.send(delegatedEntity);
});

app.get("/api/telemetry", async (req, res) => {
  const telemetry = await getTelemetry();

  return res.send(telemetry);
});

app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res, next) => {
  if (/^\/ws/.test(req.url) || /^\/api\//.test(req.url)) {
    next();
  } else {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  }
});

const server = app.listen(process.env.SERVER_PORT);
server.timeout = 10000;

console.log(`Server started on http://localhost:${process.env.SERVER_PORT}`);
