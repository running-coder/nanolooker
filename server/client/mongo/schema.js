const db = require("./");

const {
  EXPIRE_1M,
  EXPIRE_48H,
  EXPIRE_7D,
  // EXPIRE_14D,
  TOTAL_CONFIRMATIONS_COLLECTION,
  TOTAL_VOLUME_COLLECTION,
  LARGE_TRANSACTIONS,
  CONFIRMATIONS_PER_SECOND,
  TRANSACTION_COLLECTION,
  MINERS_STATS_COLLECTION,
  MARKET_CAP_STATS_COLLECTION,
  MARKET_CAP_RANK_COLLECTION,
  NODE_LOCATIONS,
} = require("../constants");

async function createIndexes() {
  const database = await db.getDatabase();
  const extraOptions = { unique: true, background: true };

  const indexExists1 = await database.collection(LARGE_TRANSACTIONS).indexExists("createdAt");
  if (!indexExists1) {
    database
      .collection(LARGE_TRANSACTIONS)
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: EXPIRE_7D, ...extraOptions });
    console.log("Index LARGE_TRANSACTIONS createdAt created successfully");
  }

  const indexExists2 = await database.collection(CONFIRMATIONS_PER_SECOND).indexExists("createdAt");
  if (!indexExists2) {
    database
      .collection(CONFIRMATIONS_PER_SECOND)
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: EXPIRE_1M, ...extraOptions });
    console.log("Index CONFIRMATIONS_PER_SECOND createdAt created successfully");
  }

  const indexExists3 = await database
    .collection(TOTAL_CONFIRMATIONS_COLLECTION)
    .indexExists("createdAt");
  if (!indexExists3) {
    database
      .collection(TOTAL_CONFIRMATIONS_COLLECTION)
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: EXPIRE_1M, ...extraOptions });
    console.log("Index TOTAL_CONFIRMATIONS_COLLECTION createdAt created successfully");
  }

  const indexExists4 = await database.collection(TOTAL_VOLUME_COLLECTION).indexExists("createdAt");
  if (!indexExists4) {
    database
      .collection(TOTAL_VOLUME_COLLECTION)
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: EXPIRE_1M, ...extraOptions });
    console.log("Index TOTAL_VOLUME_COLLECTION createdAt created successfully");
  }

  const indexExists5 = await database.collection(TRANSACTION_COLLECTION).indexExists("createdAt");
  if (!indexExists5) {
    database.collection(TRANSACTION_COLLECTION).createIndexes(
      {
        account_origin: 1,
        height: 1,
        createdAt: 1,
      },
      extraOptions,
    );
    console.log("Index TRANSACTION_COLLECTION createdAt created successfully");
  }

  const indexExists6 = await database.collection(MINERS_STATS_COLLECTION).indexExists("createdAt");
  if (!indexExists6) {
    database.collection(MINERS_STATS_COLLECTION).createIndex(
      {
        createdAt: 1,
      },
      extraOptions,
    );
    console.log("Index MINERS_STATS_COLLECTION createdAt created successfully");
  }

  const indexExists7 = await database
    .collection(MARKET_CAP_STATS_COLLECTION)
    .indexExists("createdAt");
  if (!indexExists7) {
    database.collection(MARKET_CAP_STATS_COLLECTION).createIndex(
      {
        createdAt: 1,
      },
      extraOptions,
    );
    console.log("Index MARKET_CAP_STATS_COLLECTION createdAt created successfully");
  }

  const indexExists8 = await database
    .collection(MARKET_CAP_RANK_COLLECTION)
    .indexExists("createdAt");
  if (!indexExists8) {
    database
      .collection(MARKET_CAP_RANK_COLLECTION)
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: EXPIRE_48H, ...extraOptions });
    console.log("Index MARKET_CAP_RANK_COLLECTION createdAt created successfully");
  }

  const indexExists9 = await database.collection(NODE_LOCATIONS).indexExists("createdAt");
  if (!indexExists9) {
    database
      .collection(NODE_LOCATIONS)
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: EXPIRE_48H, ...extraOptions });
    console.log("Index NODE_LOCATIONS createdAt created successfully");
  }
}

module.exports = {
  createIndexes,
};
