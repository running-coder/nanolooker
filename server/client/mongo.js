const { MongoClient } = require("mongodb");
const { Sentry } = require("../sentry");

const {
  MONGO_URL,
  MONGO_DB,
  MONGO_OPTIONS,
  EXPIRE_1M,
  EXPIRE_48H,
  EXPIRE_1W,
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

const client = new MongoClient(MONGO_URL, MONGO_OPTIONS);

async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB server");

    const db = getDatabase();
    const extraOptions = { unique: true, background: true };

    db.collection(LARGE_TRANSACTIONS).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_1W, ...extraOptions },
    );
    db.collection(CONFIRMATIONS_PER_SECOND).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_1M, ...extraOptions },
    );
    db.collection(TOTAL_CONFIRMATIONS_COLLECTION).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_48H, ...extraOptions },
    );
    db.collection(TOTAL_VOLUME_COLLECTION).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_48H, ...extraOptions },
    );
    db.collection(TRANSACTION_COLLECTION).createIndexes(
      {
        account_origin: 1,
        height: 1,
        createdAt: 1,
      },
      extraOptions,
    );
    db.collection(MINERS_STATS_COLLECTION).createIndex(
      {
        createdAt: 1,
      },
      extraOptions,
    );
    db.collection(MARKET_CAP_STATS_COLLECTION).createIndex(
      {
        createdAt: 1,
      },
      extraOptions,
    );
    db.collection(MARKET_CAP_RANK_COLLECTION).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_48H, ...extraOptions },
    );
    db.collection(NODE_LOCATIONS).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_48H, ...extraOptions },
    );
  } catch (err) {
    Sentry.captureException(err, { extra: { message: "Failed to connect to MongoDB server" } });
  }
}

// Function to retrieve the MongoDB database instance
function getDatabase() {
  return client.db(MONGO_DB);
}

module.exports = {
  connect,
  getDatabase,
};
