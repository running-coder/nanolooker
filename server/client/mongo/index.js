const { MongoClient } = require("mongodb");
const { Sentry } = require("../../sentry");
// const { createIndexes } = require("./schema");

const { MONGO_URL, MONGO_DB, MONGO_OPTIONS } = require("../../constants");

const client = new MongoClient(MONGO_URL, MONGO_OPTIONS);

function isConnected() {
  return !!client && !!client.topology && client.topology.isConnected();
}

async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB server");

    // await createIndexes();
  } catch (err) {
    Sentry.captureException(err, { extra: { message: "Failed to connect to MongoDB server" } });
  }
}

// Function to retrieve the MongoDB database instance
function getDatabase() {
  return isConnected() ? client.db(MONGO_DB) : null;
}

module.exports = {
  connect,
  getDatabase,
};
