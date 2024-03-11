const BigNumber = require("bignumber.js");
const cron = require("node-cron");
const { nodeCache } = require("../client/cache");
const db = require("../client/mongo");
const { Sentry } = require("../sentry");

const {
  EXPIRE_1M,
  EXPIRE_24H,
  EXPIRE_48H,
  EXPIRE_7D,
  EXPIRE_14D,
  TOTAL_CONFIRMATIONS_COLLECTION,
  TOTAL_CONFIRMATIONS_24H,
  TOTAL_CONFIRMATIONS_48H,
  TOTAL_CONFIRMATIONS_7D,
  TOTAL_CONFIRMATIONS_14D,
  TOTAL_VOLUME_COLLECTION,
  TOTAL_VOLUME_24H,
  TOTAL_VOLUME_48H,
  TOTAL_VOLUME_7D,
  TOTAL_VOLUME_14D,
  CONFIRMATIONS_PER_SECOND,
} = require("../constants");
const { rawToRai } = require("../utils");

// Every 3 seconds
cron.schedule("*/3 * * * * *", async () => {
  try {
    const database = await db.getDatabase();

    if (!database) {
      throw new Error("Mongo unavailable for WS CPS");
    }

    const [{ confirmationsPerSecond } = {}] = (await database
      .collection(CONFIRMATIONS_PER_SECOND)
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
      .toArray()) || [{}];

    nodeCache.set(
      CONFIRMATIONS_PER_SECOND,
      new BigNumber(confirmationsPerSecond || 0).dividedBy(EXPIRE_1M).toFormat(2),
    );
  } catch (err) {
    Sentry.captureException(err, {
      extra: {
        message: "Mongo update failed during the WS CPS",
      },
    });
  }
});

cron.schedule("*/10 * * * * *", async () => {
  try {
    const database = await db.getDatabase();

    if (!database) {
      throw new Error("Mongo unavailable for WS confirmations");
    }

    database
      .collection(TOTAL_CONFIRMATIONS_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_24H * 1000),
            },
          },
        },
        { $group: { _id: null, totalConfirmations24h: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalConfirmations24h = 0 } = {}]) => {
        nodeCache.set(TOTAL_CONFIRMATIONS_24H, totalConfirmations24h);
      });

    database
      .collection(TOTAL_CONFIRMATIONS_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_48H * 1000),
            },
          },
        },
        { $group: { _id: null, totalConfirmations48h: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalConfirmations48h = 0 } = {}]) => {
        nodeCache.set(TOTAL_CONFIRMATIONS_48H, totalConfirmations48h);
      });

    database
      .collection(TOTAL_CONFIRMATIONS_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_7D * 1000),
            },
          },
        },
        { $group: { _id: null, totalConfirmations7d: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalConfirmations7d = 0 } = {}]) => {
        nodeCache.set(TOTAL_CONFIRMATIONS_7D, totalConfirmations7d);
      });

    //conf 1w
    database
      .collection(TOTAL_CONFIRMATIONS_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_14D * 1000),
            },
          },
        },
        { $group: { _id: null, totalConfirmations14d: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalConfirmations14d = 0 } = {}]) => {
        nodeCache.set(TOTAL_CONFIRMATIONS_14D, totalConfirmations14d);
      });

    database
      .collection(TOTAL_VOLUME_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_24H * 1000),
            },
          },
        },
        { $group: { _id: null, totalVolume24h: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalVolume24h = 0 } = {}]) => {
        nodeCache.set(TOTAL_VOLUME_24H, rawToRai(totalVolume24h));
      });

    database
      .collection(TOTAL_VOLUME_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_7D * 1000),
            },
          },
        },
        { $group: { _id: null, totalVolume7d: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalVolume7d = 0 } = {}]) => {
        nodeCache.set(TOTAL_VOLUME_7D, rawToRai(totalVolume7d));
      });

    database
      .collection(TOTAL_VOLUME_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - TOTAL_VOLUME_14D * 1000),
            },
          },
        },
        { $group: { _id: null, totalVolume14d: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalVolume14d = 0 } = {}]) => {
        nodeCache.set(TOTAL_VOLUME_14D, rawToRai(totalVolume14d));
      });

    database
      .collection(TOTAL_VOLUME_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_48H * 1000),
            },
          },
        },
        { $group: { _id: null, totalVolume48h: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalVolume48h = 0 } = {}]) => {
        nodeCache.set(TOTAL_VOLUME_48H, rawToRai(totalVolume48h));
      });

    database
      .collection(TOTAL_VOLUME_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_7D * 1000),
            },
          },
        },
        { $group: { _id: null, totalVolume7d: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalVolume7d = 0 } = {}]) => {
        nodeCache.set(TOTAL_VOLUME_7D, rawToRai(totalVolume7d));
      });
    database
      .collection(TOTAL_VOLUME_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - EXPIRE_14D * 1000),
            },
          },
        },
        { $group: { _id: null, totalVolume14d: { $sum: "$value" } } },
      ])
      .toArray()
      .then(([{ totalVolume14d = 0 } = {}]) => {
        nodeCache.set(TOTAL_VOLUME_14D, rawToRai(totalVolume14d));
      });
  } catch (err) {
    Sentry.captureException(err, {
      extra: {
        message: "Mongo update failed during the WS confirmations",
      },
    });
  }
});
