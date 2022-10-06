const cron = require("node-cron");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const {
  RAIBLOCKSMC_INFO,
  RAIBLOCKSMC_LEADERBOARDS,
  EXPIRE_5M,
  EXPIRE_1M
} = require("../constants");
const fetch = require("node-fetch");


const getRaiblocksMCInfo = async () => {
  let info = nodeCache.get(RAIBLOCKSMC_INFO);

  if (info) {
    return info;
  }

  return new Promise(async resolve => {
    try {
      const res = await fetch("https://raiblocksmc-play.com:4567/info-stats");
      info = (await res.json()) || {};

      nodeCache.set(RAIBLOCKSMC_INFO, info, EXPIRE_1M);
      resolve(info);
    } catch (err) {
      console.log("Error", err);
      Sentry.captureException(err);
      resolve(null);
    }
  });
};


const getRaiblocksMCLeaderboards = async () => {

  let leaderboards = nodeCache.get(RAIBLOCKSMC_LEADERBOARDS);

  if (leaderboards) {
    return leaderboards;
  }

  return new Promise(async resolve => {
    try {
      const res = await fetch("https://raiblocksmc-play.com:4567/leaderboards-stats");
      leaderboards = (await res.json()) || {};

      nodeCache.set(RAIBLOCKSMC_LEADERBOARDS, leaderboards, EXPIRE_5M);
      resolve(leaderboards);
    } catch (err) {
      console.log("Error", err);
      Sentry.captureException(err);
      resolve(null);
    }
  });
};

module.exports = {
  getRaiblocksMCInfo, getRaiblocksMCLeaderboards
};

