require("dotenv").config();
require("./client/redis");
require("./cron/marketCapRank");
require("./cron/knownAccounts");
require("./cron/delegatedEntity");
require("./cron/nodeLocations");
require("./cron/nodeMonitors");
require("./cron/telemetry");
require("./cron/ws");
require("./cron/coingeckoStats");
require("./cron/btcTransactionFees");
require("./cron/nanotickerStats");
require("./cron/nanobrowserquestStats");
require("./cron/2minersStats");
require("./cron/youtubePlaylist");
require("./ws");
const { getDistributionData } = require("./cron/distribution");
const { getExchangeBalances } = require("./cron/exchangeTracker");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { rpc, allowedRpcMethods } = require("./rpc");
const bodyParser = require("body-parser");
const path = require("path");
const { nodeCache } = require("./client/cache");
const {
  TOTAL_CONFIRMATIONS_24H,
  TOTAL_VOLUME_24H,
  TOTAL_CONFIRMATIONS_48H,
  TOTAL_VOLUME_48H,
  CONFIRMATIONS_PER_SECOND,
  NANOTICKER_STATS,
  NANOBROWSERQUEST_PLAYERS,
  NANOBROWSERQUEST_LEADERBOARD,
} = require("./constants");
const {
  getBtcTransactionFees,
  BITCOIN_TOTAL_TRANSACTION_FEES_24H,
  BITCOIN_TOTAL_TRANSACTION_FEES_48H,
} = require("./api/btcTransactionFees");
const { getYoutubePlaylist } = require("./api/youtubePlaylist");
const {
  getCoingeckoStats,
  getCoingeckoMarketCapStats,
} = require("./api/coingeckoStats");
const { get2MinersStats } = require("./api/2minersStats");
const {
  getDeveloperFundTransactions,
} = require("./api/developerFundTransactions");
const { getLargeTransactions } = require("./api/largeTransactions");
const { getNodeStatus } = require("./api/nodeStatus");
const {
  getKnownAccounts,
  getKnownAccountsBalance,
} = require("./api/knownAccounts");
const {
  getDelegatorsPage,
  getAllDelegatorsCount,
} = require("./api/delegators");
const {
  getIsAccountFilterable,
  getFilteredTransactions,
} = require("./api/transactionFilters");

const { getRichListPage, getRichListAccount } = require("./api/richList");
const { getParticipant, getParticipantsPage } = require("./api/participants");
const { getNodeLocations } = require("./api/nodeLocations");
const { getNodeMonitors } = require("./api/nodeMonitors");
const { getDelegatedEntity } = require("./api/delegatedEntity");
const { getTelemetry } = require("./api/telemetry");
const {
  getRepresentative,
  getAllRepresentatives,
} = require("./api/representative");
const { Sentry } = require("./sentry");
const { isValidAccountAddress } = require("./utils");

const app = express();

app.use(
  cors({
    origin: true,
  }),
);

app.use(bodyParser.json());

app.post("/api/rpc", async (req, res) => {
  const { action, ...params } = req.body || {};

  let rpcDomain = req.header("x-rpc") || undefined;
  if (rpcDomain && !/^https?:\/\//.test(rpcDomain)) {
    rpcDomain = `http://${rpcDomain}`;
  }

  if (!action) {
    res.status(422).send("Missing action");
  } else if (!allowedRpcMethods.includes(action)) {
    res.status(422).send("RPC action not allowed");
  } else {
    const result = await rpc(action, params, true, rpcDomain);
    res.send(result);
  }
});

app.get("/api/confirmations-per-second", (req, res) => {
  res.send({ cps: nodeCache.get(CONFIRMATIONS_PER_SECOND) });
});

app.get("/api/distribution", (req, res) => {
  const data = getDistributionData();

  res.send(data);
});

// @TODO ADD getDelegators && getAllDelegators if req.account is specified
app.get("/api/delegators", async (req, res) => {
  let data;
  const { account, page } = req.query;

  if (isValidAccountAddress(account)) {
    data = await getDelegatorsPage({ account, page });
  } else {
    data = await getAllDelegatorsCount();
  }

  res.send(data);
});

app.get("/api/transaction-filters", async (req, res) => {
  let data;
  let isFilterable = false;
  const { account, filters } = req.query;

  if (isValidAccountAddress(account)) {
    isFilterable = await getIsAccountFilterable(account);

    if (isFilterable && filters) {
      data = await getFilteredTransactions({ account, filters });
    } else {
      data = { isFilterable };
    }
  }

  res.send(data);
});

app.get("/api/large-transactions", async (req, res) => {
  const { largeTransactions } = await getLargeTransactions();

  res.send(largeTransactions);
});

app.get("/api/exchange-tracker", async (req, res) => {
  const exchangeBalances = await getExchangeBalances();

  res.send(exchangeBalances);
});

app.get("/api/developer-fund/transactions", async (req, res) => {
  const { developerFundTransactions } = await getDeveloperFundTransactions();

  res.send(developerFundTransactions);
});

app.get("/api/market-statistics", async (req, res) => {
  const cachedConfirmations24h = nodeCache.get(TOTAL_CONFIRMATIONS_24H);
  const cachedVolume24h = nodeCache.get(TOTAL_VOLUME_24H);
  const cachedConfirmations48h = nodeCache.get(TOTAL_CONFIRMATIONS_48H);
  const cachedVolume48h = nodeCache.get(TOTAL_VOLUME_48H);

  const { btcTransactionFees24h, btcTransactionFees48h } =
    await getBtcTransactionFees();
  const { marketStats, priceStats } = await getCoingeckoStats({
    fiat: req.query.fiat,
    cryptocurrency: req.query.cryptocurrency,
  });

  res.send({
    [TOTAL_CONFIRMATIONS_24H]: cachedConfirmations24h,
    [TOTAL_VOLUME_24H]: cachedVolume24h,
    [TOTAL_CONFIRMATIONS_48H]: cachedConfirmations48h,
    [TOTAL_VOLUME_48H]: cachedVolume48h,
    [BITCOIN_TOTAL_TRANSACTION_FEES_24H]: btcTransactionFees24h,
    [BITCOIN_TOTAL_TRANSACTION_FEES_48H]: btcTransactionFees48h,
    ...marketStats,
    priceStats: {
      ...{ bitcoin: { usd: 0 } },
      ...priceStats,
    },
  });
});

app.get("/api/statistics/social", async (req, res) => {
  const data = await getCoingeckoMarketCapStats();

  res.send(data);
});

app.get("/api/statistics/2miners", async (req, res) => {
  const data = await get2MinersStats();

  res.send(data);
});

app.get("/api/known-accounts", async (req, res) => {
  const knownAccounts = await getKnownAccounts();

  res.send(knownAccounts);
});

app.get("/api/known-accounts-balance", async (req, res) => {
  const knownAccountsBalance = await getKnownAccountsBalance();

  res.send(knownAccountsBalance);
});

app.get("/api/node-status", async (req, res) => {
  const { nodeStatus } = await getNodeStatus();

  res.send(nodeStatus);
});

app.get("/api/node-monitors", async (req, res) => {
  const nodeMonitors = await getNodeMonitors();

  res.send(nodeMonitors);
});

app.get("/api/node-locations", async (req, res) => {
  const nodeLocations = await getNodeLocations();

  res.send(nodeLocations);
});

app.get("/api/representative", async (req, res) => {
  const { account } = req.query;

  const representative = account
    ? await getRepresentative(account)
    : getAllRepresentatives();

  res.send(representative);
});

app.get("/api/delegated-entity", async (req, res) => {
  const delegatedEntity = await getDelegatedEntity();

  res.send(delegatedEntity);
});

app.get("/api/telemetry", async (req, res) => {
  const telemetry = await getTelemetry();

  res.send(telemetry);
});

app.get("/api/rich-list", async (req, res) => {
  const { page, account } = req.query;
  let data;
  if (page) {
    data = await getRichListPage(page);
  } else if (account) {
    data = await getRichListAccount(account);
  }

  res.send(data);
});

app.get("/api/participants", async (req, res) => {
  const { page, account } = req.query;
  let data;
  if (account) {
    data = await getParticipant(account);
  } else if (page) {
    data = await getParticipantsPage(page);
  }

  res.send(data);
});

app.get("/api/nanoquakejs/scores", async (req, res) => {
  let json = {};
  try {
    const res = await fetch("https://rainstorm.city/nanoquake/scores");
    json = await res.json();
  } catch (err) {
    Sentry.captureException(err);
  }

  res.send(json);
});

app.post("/api/nanoquakejs/register", async (req, res, next) => {
  try {
    const response = await fetch("https://rainstorm.city/nanoquake/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const json = await response.json();
    res.send(json);
  } catch (err) {
    next(err);
  }
});

app.get("/api/nanobrowserquest/players", async (req, res, next) => {
  try {
    res.send(nodeCache.get(NANOBROWSERQUEST_PLAYERS) || {});
  } catch (err) {
    next(err);
  }
});

app.get("/api/nanobrowserquest/leaderboard", async (req, res, next) => {
  try {
    res.send(nodeCache.get(NANOBROWSERQUEST_LEADERBOARD) || []);
  } catch (err) {
    next(err);
  }
});

app.get("/api/nanoticker", async (req, res) => {
  res.send(nodeCache.get(NANOTICKER_STATS) || {});
});

app.get("/api/youtube-playlist", async (req, res) => {
  const playlist = await getYoutubePlaylist();

  res.send(playlist || {});
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
server.timeout = 20000;

console.log(`Server started on http://localhost:${process.env.SERVER_PORT}`);
