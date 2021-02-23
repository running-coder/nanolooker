const WS = require("ws");
const BigNumber = require("bignumber.js");
const ReconnectingWebSocket = require("reconnecting-websocket");
const {
  MONGO_URL,
  MONGO_DB,
  MONGO_OPTIONS,
  TOTAL_CONFIRMATIONS_COLLECTION,
  TOTAL_NANO_VOLUME_COLLECTION,
  LARGE_TRANSACTIONS,
} = require("../constants");
const { rawToRai } = require("../utils");

const UPDATE_CACHE_INTERVAL = 10000;

let updateDbInterval = null;

const { MongoClient } = require("mongodb");

let db;
MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (_err, client) => {
  db = client.db(MONGO_DB);
});

let accumulatedConfirmations = 0;
let accumulatedVolume = 0;
let accumulatedLargeTransactionHashes = [];

// https://github.com/cryptocode/nano-websocket-sample-nodejs/blob/master/index.js
const ws = new ReconnectingWebSocket("wss://www.nanolooker.com/ws", [], {
  WebSocket: WS,
  connectionTimeout: 1000,
  maxRetries: 100000,
  maxReconnectionDelay: 2000,
  minReconnectionDelay: 10,
});

ws.onopen = () => {
  console.log("WS OPENED");
  const subscription = {
    action: "subscribe",
    topic: "confirmation",
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

    if (subtype === "send" && rawToRai(amount) >= 5000) {
      // Adding date because the message doesn't contain one
      message.timestamp = Date.now();
      accumulatedLargeTransactionHashes.push(message);
    }

    if (["send", "receive"].includes(subtype)) {
      accumulatedVolume = new BigNumber(amount)
        .plus(accumulatedVolume)
        .toNumber();
    }
  }
};

function updateDb() {
  if (!db) return;

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
    accumulatedConfirmations = 0;
  }

  if (accumulatedVolume) {
    db.collection(TOTAL_NANO_VOLUME_COLLECTION).insertOne({
      value: accumulatedVolume,
      createdAt: new Date(),
    });
    accumulatedVolume = 0;
  }
}

// Catches ctrl+c event
process.once("SIGINT", () => {
  updateDb();
  console.log("process.kill: SIGINT");
  process.kill(process.pid, "SIGINT");
});

// Catches "kill pid"ss
process.once("SIGUSR1", () => {
  updateDb();
  console.log("process.kill: SIGISIGUSR1NT");
  process.kill(process.pid, "SIGUSR1");
});

// Used by Nodemon to restart
process.once("SIGUSR2", () => {
  updateDb();
  console.log("process.kill: SIGUSR2");
  process.kill(process.pid, "SIGUSR2");
});
