const WS = require("ws");
const BigNumber = require("bignumber.js");
const ReconnectingWebSocket = require("reconnecting-websocket");
const { Sentry } = require("../sentry");
const {
  MONGO_URL,
  MONGO_DB,
  MONGO_OPTIONS,
  TOTAL_CONFIRMATIONS_COLLECTION,
  TOTAL_VOLUME_COLLECTION,
  LARGE_TRANSACTIONS,
  CONFIRMATIONS_PER_SECOND,
} = require("../constants");

const UPDATE_CACHE_INTERVAL = 10000;

let updateDbInterval = null;

const { MongoClient } = require("mongodb");

let db;
try {
  MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
    if (err) {
      throw err;
    }
    db = client.db(MONGO_DB);
  });
} catch (err) {
  console.log("Error", err);
  Sentry.captureException(err);
}

let accumulatedConfirmations = 0;
let accumulatedVolume = 0;
let accumulatedLargeTransactionHashes = [];

// https://github.com/cryptocode/nano-websocket-sample-nodejs/blob/master/index.js
const ws = new ReconnectingWebSocket("wss://www.nanolooker.com/ws", [], {
  WebSocket: WS,
  connectionTimeout: 10000,
  maxRetries: 100000,
  maxReconnectionDelay: 2000,
  minReconnectionDelay: 10,
});

ws.onopen = () => {
  console.log("WS OPENED");
  const subscription = {
    action: "subscribe",
    topic: "confirmation",
    options: {
      confirmation_type: "active_quorum",
    },
  };
  ws.send(JSON.stringify(subscription));

  updateDbInterval = setInterval(updateDb, UPDATE_CACHE_INTERVAL);
};

ws.onclose = () => {
  console.log("WS close");
  clearInterval(updateDbInterval);
  updateDb();
};

ws.onerror = () => {
  console.log("WS ERROR");
  clearInterval(updateDbInterval);
  updateDb();
};

ws.onmessage = msg => {
  const { topic, message } = JSON.parse(msg.data);
  const {
    amount,
    block: { subtype },
  } = message;

  if (topic === "confirmation") {
    accumulatedConfirmations = accumulatedConfirmations + 1;

    // 10,000 NANO
    if (subtype === "send" && amount.length >= 35) {
      // Adding date because the message doesn't contain one
      message.timestamp = Date.now();
      accumulatedLargeTransactionHashes.push(message);
    }

    // Skip accumulating dust amounts
    if (["send", "receive"].includes(subtype) && amount.length >= 25) {
      accumulatedVolume = new BigNumber(amount)
        .plus(accumulatedVolume)
        .toNumber();
    }
  }
};

function updateDb() {
  if (!db) return;

  try {
    if (accumulatedLargeTransactionHashes.length) {
      db.collection(LARGE_TRANSACTIONS).insertOne({
        value: accumulatedLargeTransactionHashes,
        createdAt: new Date(),
      });
      accumulatedLargeTransactionHashes = [];
    }

    if (accumulatedConfirmations) {
      db.collection(TOTAL_CONFIRMATIONS_COLLECTION).insertOne({
        value: accumulatedConfirmations,
        createdAt: new Date(),
      });
      db.collection(CONFIRMATIONS_PER_SECOND).insertOne({
        value: accumulatedConfirmations,
        createdAt: new Date(),
      });
      accumulatedConfirmations = 0;
    }

    if (accumulatedVolume) {
      db.collection(TOTAL_VOLUME_COLLECTION).insertOne({
        value: accumulatedVolume,
        createdAt: new Date(),
      });
      accumulatedVolume = 0;
    }
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
}

// Catches ctrl+c event
process.once("SIGINT", err => {
  updateDb();
  Sentry.captureException(err);
  console.log("process.kill: SIGINT");
  process.kill(process.pid, "SIGINT");
});

// Catches "kill pid"ss
process.once("SIGUSR1", err => {
  updateDb();
  Sentry.captureException(err);
  console.log("process.kill: SIGISIGUSR1NT");
  process.kill(process.pid, "SIGUSR1");
});

// Used by Nodemon to restart
process.once("SIGUSR2", err => {
  updateDb();
  Sentry.captureException(err);
  console.log("process.kill: SIGUSR2");
  process.kill(process.pid, "SIGUSR2");
});
