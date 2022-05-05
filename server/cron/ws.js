const MongoClient = require("mongodb").MongoClient;
const BigNumber = require("bignumber.js");
const cron = require("node-cron");
const { nodeCache } = require("../client/cache");
const { Sentry } = require("../sentry");

const {
  MONGO_URL,
  MONGO_DB,
  MONGO_OPTIONS,
  EXPIRE_1M,
  EXPIRE_24H,
  EXPIRE_48H,
  EXPIRE_1W,
  TOTAL_CONFIRMATIONS_COLLECTION,
  TOTAL_CONFIRMATIONS_24H,
  TOTAL_CONFIRMATIONS_48H,
  TOTAL_VOLUME_COLLECTION,
  TOTAL_VOLUME_24H,
  TOTAL_VOLUME_48H,
  LARGE_TRANSACTIONS,
  CONFIRMATIONS_PER_SECOND,
} = require("../constants");
const { rawToRai } = require("../utils");

let db;
let mongoClient;

function isConnected() {
  return (
    !!mongoClient &&
    !!mongoClient.topology &&
    mongoClient.topology.isConnected()
  );
}

const connect = async () =>
  await new Promise((resolve, reject) => {
    try {
      MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
        if (err) {
          throw err;
        }
        mongoClient = client;
        db = client.db(MONGO_DB);

        db.collection(LARGE_TRANSACTIONS).createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: EXPIRE_1W },
        );
        db.collection(CONFIRMATIONS_PER_SECOND).createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: EXPIRE_1M },
        );
        db.collection(TOTAL_CONFIRMATIONS_COLLECTION).createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: EXPIRE_48H },
        );
        db.collection(TOTAL_VOLUME_COLLECTION).createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: EXPIRE_48H },
        );

        resolve();
      });
    } catch (err) {
      Sentry.captureException(err);
      resolve();
    }
  });

// Every 3 seconds
cron.schedule("*/3 * * * * *", async () => {
  if (!isConnected()) {
    await connect();
  }

  try {
    db.collection(CONFIRMATIONS_PER_SECOND)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_1M * 1000),
            },
          },
        },
        { $group: { _id: null, confirmationsPerSecond: { $sum: "$value" } } },
      ])
      .toArray((_err, [{ confirmationsPerSecond = 0 } = {}] = []) => {
        nodeCache.set(
          CONFIRMATIONS_PER_SECOND,
          new BigNumber(confirmationsPerSecond)
            .dividedBy(EXPIRE_1M)
            .toFormat(2),
        );
      });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
});

cron.schedule("*/10 * * * * *", async () => {
  if (!isConnected()) {
    return;
  }

  try {
    db.collection(TOTAL_CONFIRMATIONS_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_24H * 1000),
            },
          },
        },
        { $group: { _id: null, totalConfirmations: { $sum: "$value" } } },
      ])
      .toArray((_err, [{ totalConfirmations = 0 } = {}] = []) => {
        nodeCache.set(TOTAL_CONFIRMATIONS_24H, totalConfirmations);
      });

    db.collection(TOTAL_CONFIRMATIONS_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_48H * 1000),
            },
          },
        },
        { $group: { _id: null, totalConfirmations: { $sum: "$value" } } },
      ])
      .toArray((_err, [{ totalConfirmations = 0 } = {}] = []) => {
        nodeCache.set(TOTAL_CONFIRMATIONS_48H, totalConfirmations);
      });

    db.collection(TOTAL_VOLUME_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_24H * 1000),
            },
          },
        },
        { $group: { _id: null, totalVolume: { $sum: "$value" } } },
      ])
      .toArray((_err, [{ totalVolume = 0 } = {}] = []) => {
        nodeCache.set(TOTAL_VOLUME_24H, rawToRai(totalVolume));
      });

    db.collection(TOTAL_VOLUME_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_48H * 1000),
            },
          },
        },
        { $group: { _id: null, totalVolume: { $sum: "$value" } } },
      ])
      .toArray((_err, [{ totalVolume = 0 } = {}] = []) => {
        nodeCache.set(TOTAL_VOLUME_48H, rawToRai(totalVolume));
      });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
});
