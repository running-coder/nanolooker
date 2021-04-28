const cron = require("node-cron");
const fetch = require("node-fetch");
const MongoClient = require("mongodb").MongoClient;
const { nodeCache } = require("../cache");
const { Sentry } = require("../sentry");
const { getPeers } = require("./networkStatus");
const {
  MONGO_DB,
  MONGO_URL,
  MONGO_OPTIONS,
  REPRESENTATIVE_LOCATION,
  EXPIRE_48H,
} = require("../constants");

let db;
try {
  MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
    if (err) {
      throw err;
    }

    db = client.db(MONGO_DB);

    db.collection(REPRESENTATIVE_LOCATION).createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: EXPIRE_48H },
    );
  });
} catch (err) {
  console.log("Error", err);
  Sentry.captureException(err);
}

const getRepresentativeLocation = async ip => {
  try {
    const res = await fetch(
      `https://ipapi.co/${ip}/json/?key=${process.env.IPAPI_KEY}`,
    );
    const {
      version,
      city,
      region,
      country,
      country_name,
      continent_code,
      in_eu,
      currency,
      latitude,
      longitude,
      timezone,
      utc_offset,
      asn,
      org,
    } = await res.json();

    return {
      version,
      city,
      region,
      country,
      country_name,
      continent_code,
      in_eu,
      currency,
      latitude,
      longitude,
      timezone,
      utc_offset,
      asn,
      org,
    };
  } catch (err) {
    console.log(`${ip} has no monitor`);
  }

  return {};
};

const doRepresentativeLocation = async () => {
  console.log("Starting doRepresentativeLocation");

  try {
    let peers = await getPeers();

    const results = await Promise.all(
      peers.map(async ({ account, ip }) => {
        const location = await getRepresentativeLocation(ip);

        return {
          account,
          ip,
          location,
        };
      }),
    );

    db.collection(REPRESENTATIVE_LOCATION).remove();
    db.collection(REPRESENTATIVE_LOCATION).insertMany(results);

    nodeCache.set(REPRESENTATIVE_LOCATION, results);
  } catch (err) {
    Sentry.captureException(err);
  }
};

// https://crontab.guru/#00_01,13_*_*_*
// At minute 0 past hour 1 and 13.”
cron.schedule("00 01,13 * * *", () => {
  if (process.env.NODE_ENV !== "production") return;

  doRepresentativeLocation();
});
