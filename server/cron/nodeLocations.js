const cron = require("node-cron");
const fetch = require("node-fetch");
const chunk = require("lodash/chunk");
const { rpc } = require("../rpc");
const { nodeCache } = require("../client/cache");
const db = require("../client/mongo");
const { Sentry } = require("../sentry");
const { NODE_LOCATIONS, EXPIRE_48H } = require("../constants");

const NODE_IP_REGEX = /\[::ffff:([\d.]+)\]:[\d]+/;

const getNodePeers = async () => {
  let peers;
  try {
    const { peers: rawPeers } = await rpc("peers", {
      peer_details: true,
    });

    peers = Object.entries(rawPeers).map(([rawIp, { node_id: nodeId }]) => {
      const [, ip] = rawIp.match(NODE_IP_REGEX);
      return { ip, rawIp, nodeId };
    });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return peers;
};

const getNodeLocation = async ip => {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/?key=${process.env.IPAPI_KEY}`);
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
    console.log(`${ip} had no response`);
  }

  return {};
};

const doNodeLocations = async () => {
  console.log("Starting doNodeLocations");
  const nodeLocations = nodeCache.get(NODE_LOCATIONS);
  try {
    if (nodeLocations) {
      return nodeLocations;
    }
    let peers = await getNodePeers();
    let results = [];

    const peersChunks = chunk(peers, 20);

    for (let i = 0; i < peersChunks.length; i++) {
      console.log(`Processing node location ${i + 1} of ${peersChunks.length}`);
      const locationResults = await Promise.all(
        peersChunks[i].map(async ({ ip, ...rest }) => {
          const location = await getNodeLocation(ip);

          return {
            ip,
            ...rest,
            location,
          };
        }),
      );

      results = results.concat(locationResults);
    }

    const database = await db.getDatabase();

    if (!database) {
      throw new Error("Mongo unavailable for doNodeLocations");
    }

    await database.collection(NODE_LOCATIONS).deleteMany({});
    await database.collection(NODE_LOCATIONS).insertMany(results);

    nodeCache.set(NODE_LOCATIONS, results, EXPIRE_48H);

    console.log("Done node location");
  } catch (err) {
    Sentry.captureException(err);
  }
};

// https://crontab.guru/#00_01,13_*_*_*
// At minute 0 past hour 1 and 13.”
cron.schedule("00 01,13 * * *", () => {
  if (process.env.NODE_ENV !== "production") return;

  doNodeLocations();
});
