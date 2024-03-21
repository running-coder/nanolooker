const WS = require("ws");
const BigNumber = require("bignumber.js");
const { WsReconnect } = require("websocket-reconnect");
const { Sentry } = require("../sentry");
const db = require("../client/mongo");
const {
  TOTAL_CONFIRMATIONS_COLLECTION,
  TOTAL_VOLUME_COLLECTION,
  LARGE_TRANSACTIONS,
  CONFIRMATIONS_PER_SECOND,
} = require("../constants");

const UPDATE_CACHE_INTERVAL = 10000;

let updateDbInterval = null;
let accumulatedConfirmations = 0;
let accumulatedVolume = 0;
let accumulatedLargeTransactionHashes = [];

// https://github.com/cryptocode/nano-websocket-sample-nodejs/blob/master/index.js
const ws = new WsReconnect({ reconnectDelay: 5000 });
ws.open(`wss://www.nanolooker.com/ws:${process.env.WS_PORT}`);
ws.on("open", () => {
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
});

ws.on("close", () => {
  console.log("WS close");
  clearInterval(updateDbInterval);
  updateDb();
});

ws.on("error", err => {
  console.log("WS ERROR", err);
  clearInterval(updateDbInterval);
  updateDb();
});

ws.onmessage = msg => {
  if (Buffer.isBuffer(msg)) {
    const buffer = Buffer.from(msg, "hex");
    const jsonString = buffer?.toString("utf-8");

    msg = {
      data: jsonString,
    };

  }

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
      accumulatedVolume = new BigNumber(amount).plus(accumulatedVolume).toNumber();
    }
  }
};

async function updateDb() {
  try {
    const database = await db.getDatabase();

    if (!database) {
      throw new Error("Mongo unavailable for updateDb");
    }

    if (accumulatedLargeTransactionHashes.length) {
      database.collection(LARGE_TRANSACTIONS).insertOne({
        value: accumulatedLargeTransactionHashes,
        createdAt: new Date(),
      });
      accumulatedLargeTransactionHashes = [];
    }

    if (accumulatedConfirmations) {
      database.collection(TOTAL_CONFIRMATIONS_COLLECTION).insertOne({
        value: accumulatedConfirmations,
        createdAt: new Date(),
      });
      database.collection(CONFIRMATIONS_PER_SECOND).insertOne({
        value: accumulatedConfirmations,
        createdAt: new Date(),
      });
      accumulatedConfirmations = 0;
    }

    if (accumulatedVolume) {
      database.collection(TOTAL_VOLUME_COLLECTION).insertOne({
        value: accumulatedVolume,
        createdAt: new Date(),
      });
      accumulatedVolume = 0;
    }
  } catch (err) {
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
