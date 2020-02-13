const fs = require("fs");
const NodeCache = require("node-cache");
const WS = require("ws");
const BigNumber = require("bignumber.js");
const ReconnectingWebSocket = require("reconnecting-websocket");

const CACHE_FILE_NAME = "cache.json";
const EXPIRE_CACHE_24H = 86400;
const UPDATE_CACHE_INTERVAL = 5000;
const TOTAL_CONFIRMATION_KEY_24H = "total_confirmations_24h";
const TOTAL_NANO_VOLUME_KEY_24H = "total_nano_volume_24h";
const TOTAL_CONFIRMATION_KEY_48H = "total_confirmations_48h";
const TOTAL_NANO_VOLUME_KEY_48H = "total_nano_volume_48h";
let updateCacheInterval = null;

const wsCache = new NodeCache({
  checkperiod: 5,
  deleteOnExpire: true
});

try {
  let wsKeys = JSON.parse(fs.readFileSync(CACHE_FILE_NAME) || []);
  wsKeys.forEach(({ key, value, ttl }) => wsCache.set(key, value, ttl));

  fs.unlinkSync(CACHE_FILE_NAME);
} catch (e) {}

if (!wsCache.has(TOTAL_CONFIRMATION_KEY_24H)) {
  wsCache.set(TOTAL_CONFIRMATION_KEY_24H, 0);
}
if (!wsCache.has(TOTAL_NANO_VOLUME_KEY_24H)) {
  wsCache.set(TOTAL_NANO_VOLUME_KEY_24H, 0);
}
if (!wsCache.has(TOTAL_CONFIRMATION_KEY_48H)) {
  wsCache.set(TOTAL_CONFIRMATION_KEY_48H, 0);
}
if (!wsCache.has(TOTAL_NANO_VOLUME_KEY_48H)) {
  wsCache.set(TOTAL_NANO_VOLUME_KEY_48H, 0);
}

wsCache.on("expired", function(key, value) {
  if (key.startsWith(TOTAL_CONFIRMATION_KEY_24H)) {
    const cachedTotalConfirmations24h = wsCache.get(TOTAL_CONFIRMATION_KEY_24H);
    wsCache.set(
      TOTAL_CONFIRMATION_KEY_24H,
      cachedTotalConfirmations24h - value
    );

    const cachedTotalConfirmations48h = wsCache.get(TOTAL_CONFIRMATION_KEY_48H);
    wsCache.set(
      TOTAL_CONFIRMATION_KEY_48H,
      cachedTotalConfirmations48h + value
    );

    wsCache.set(
      `${TOTAL_CONFIRMATION_KEY_48H}-${new Date().getTime()}`,
      value,
      EXPIRE_CACHE_24H
    );
  } else if (key.startsWith(TOTAL_NANO_VOLUME_KEY_24H)) {
    const cachedVolume24h = wsCache.get(TOTAL_NANO_VOLUME_KEY_24H);
    wsCache.set(
      TOTAL_NANO_VOLUME_KEY_24H,
      new BigNumber(cachedVolume24h).minus(value).toNumber()
    );

    const cachedVolume48h = wsCache.get(TOTAL_NANO_VOLUME_KEY_48H);
    wsCache.set(TOTAL_NANO_VOLUME_KEY_48H, cachedVolume48h + value);

    wsCache.set(
      `${TOTAL_NANO_VOLUME_KEY_48H}-${new Date().getTime()}`,
      value,
      EXPIRE_CACHE_24H
    );
  } else if (key.startsWith(TOTAL_CONFIRMATION_KEY_48H)) {
    const cachedTotalConfirmations48h = wsCache.get(TOTAL_CONFIRMATION_KEY_48H);
    wsCache.set(
      TOTAL_CONFIRMATION_KEY_48H,
      cachedTotalConfirmations48h - value
    );
  } else if (key.startsWith(TOTAL_NANO_VOLUME_KEY_48H)) {
    const cachedVolume48 = wsCache.get(TOTAL_NANO_VOLUME_KEY_48H);
    wsCache.set(
      TOTAL_NANO_VOLUME_KEY_48H,
      new BigNumber(cachedVolume48).minus(value).toNumber()
    );
  }
});

let accumulatedConfirmations = 0;
let accumulatedVolume = 0;

// https://github.com/cryptocode/nano-websocket-sample-nodejs/blob/master/index.js
const ws = new ReconnectingWebSocket("wss://www.nanolooker.com/ws", [], {
  WebSocket: WS,
  connectionTimeout: 1000,
  maxRetries: 100000,
  maxReconnectionDelay: 2000,
  minReconnectionDelay: 10
});

ws.onopen = () => {
  console.log("WS OPENED");
  const subscription = {
    action: "subscribe",
    topic: "confirmation"
  };
  ws.send(JSON.stringify(subscription));

  updateCacheInterval = setInterval(updateCache, UPDATE_CACHE_INTERVAL);
};

ws.onclose = () => {
  console.log("WS close");
  clearInterval(updateCacheInterval);
  updateCache();
};

ws.onerror = () => {
  console.log("WS ERROR");
  clearInterval(updateCacheInterval);
  updateCache();
};

const updateCache = () => {
  const timestamp = new Date().getTime();

  if (accumulatedConfirmations) {
    wsCache.set(
      `${TOTAL_CONFIRMATION_KEY_24H}-${timestamp}`,
      accumulatedConfirmations,
      EXPIRE_CACHE_24H
    );

    const cachedTotalConfirmations = wsCache.get(TOTAL_CONFIRMATION_KEY_24H);
    wsCache.set(
      TOTAL_CONFIRMATION_KEY_24H,
      accumulatedConfirmations + cachedTotalConfirmations
    );
    accumulatedConfirmations = 0;
  }

  if (accumulatedVolume) {
    wsCache.set(
      `${TOTAL_NANO_VOLUME_KEY_24H}-${timestamp}`,
      accumulatedVolume,
      EXPIRE_CACHE_24H
    );

    const cachedVolume = wsCache.get(TOTAL_NANO_VOLUME_KEY_24H);
    wsCache.set(
      TOTAL_NANO_VOLUME_KEY_24H,
      new BigNumber(accumulatedVolume).plus(cachedVolume).toNumber()
    );
    accumulatedVolume = 0;
  }
};

ws.onmessage = msg => {
  const {
    topic,
    message: {
      amount,
      block: { subtype }
    }
  } = JSON.parse(msg.data);

  if (topic === "confirmation") {
    accumulatedConfirmations = accumulatedConfirmations + 1;

    if (["send", "receive"].includes(subtype)) {
      accumulatedVolume = new BigNumber(amount)
        .plus(accumulatedVolume)
        .toNumber();
    }
  }
};

process.once("SIGINT", () => {
  saveWsCacheToFile();
});

process.once("SIGHUP", () => {
  saveWsCacheToFile();
});

const saveWsCacheToFile = () => {
  const now = new Date().getTime();

  const wsKeys = wsCache.keys().map(key => ({
    key,
    value: wsCache.get(key),
    ttl: Math.floor(((wsCache.getTtl(key) || now) - now) / 1000)
  }));

  fs.writeFileSync(CACHE_FILE_NAME, JSON.stringify(wsKeys, null, 2));
};

module.exports = {
  wsCache,
  TOTAL_CONFIRMATION_KEY_24H,
  TOTAL_NANO_VOLUME_KEY_24H,
  TOTAL_CONFIRMATION_KEY_48H,
  TOTAL_NANO_VOLUME_KEY_48H
};
