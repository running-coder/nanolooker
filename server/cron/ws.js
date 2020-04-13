const MongoClient = require("mongodb").MongoClient;
const cron = require("node-cron");
const { wsCache } = require("../ws/cache");

const {
  MONGO_URL,
  MONGO_DB,
  MONGO_OPTIONS,
  EXPIRE_24H,
  EXPIRE_48H,
  TOTAL_CONFIRMATIONS_COLLECTION,
  TOTAL_CONFIRMATIONS_KEY_24H,
  TOTAL_CONFIRMATIONS_KEY_48H,
  TOTAL_NANO_VOLUME_COLLECTION,
  TOTAL_NANO_VOLUME_KEY_24H,
  TOTAL_NANO_VOLUME_KEY_48H
} = require("../constants");
const { rawToRai } = require("../utils");

let db;
let mongoClient;
MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (_err, client) => {
  if (_err) {
    throw _err;
  }

  mongoClient = client;
  db = client.db(MONGO_DB);

  db.collection(TOTAL_CONFIRMATIONS_COLLECTION).createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: EXPIRE_48H }
  );
  db.collection(TOTAL_NANO_VOLUME_COLLECTION).createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: EXPIRE_48H }
  );
});

cron.schedule("*/10 * * * * *", async () => {
  if (!db) return;

  Promise.all([
    new Promise(resolve => {
      db.collection(TOTAL_CONFIRMATIONS_COLLECTION)
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - EXPIRE_24H * 1000)
              }
            }
          },
          { $group: { _id: null, totalConfirmations: { $sum: "$value" } } }
        ])
        .toArray((_err, [{ totalConfirmations = 0 } = {}] = []) => {
          wsCache.set(TOTAL_CONFIRMATIONS_KEY_24H, totalConfirmations);
          resolve();
        });
    }),
    new Promise(resolve => {
      db.collection(TOTAL_CONFIRMATIONS_COLLECTION)
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - EXPIRE_48H * 1000)
              }
            }
          },
          { $group: { _id: null, totalConfirmations: { $sum: "$value" } } }
        ])
        .toArray((_err, [{ totalConfirmations = 0 } = {}] = []) => {
          wsCache.set(TOTAL_CONFIRMATIONS_KEY_48H, totalConfirmations);
          resolve();
        });
    }),
    new Promise(resolve => {
      db.collection(TOTAL_NANO_VOLUME_COLLECTION)
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - EXPIRE_24H * 1000)
              }
            }
          },
          { $group: { _id: null, totalNanoVolume: { $sum: "$value" } } }
        ])
        .toArray((_err, [{ totalNanoVolume = 0 } = {}] = []) => {
          wsCache.set(TOTAL_NANO_VOLUME_KEY_24H, rawToRai(totalNanoVolume));
          resolve();
        });
    }),
    new Promise(resolve => {
      db.collection(TOTAL_NANO_VOLUME_COLLECTION)
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - EXPIRE_48H * 1000)
              }
            }
          },
          { $group: { _id: null, totalNanoVolume: { $sum: "$value" } } }
        ])
        .toArray((_err, [{ totalNanoVolume = 0 } = {}] = []) => {
          wsCache.set(TOTAL_NANO_VOLUME_KEY_48H, rawToRai(totalNanoVolume));
          resolve();
        });
    })
  ]).then(() => {
    mongoClient.close();
  });
});
