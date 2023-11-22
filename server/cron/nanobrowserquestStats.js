const cron = require("node-cron");
const redis = require("redis");
const chunk = require("lodash/chunk");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const { NANOBROWSERQUEST_PLAYERS, NANOBROWSERQUEST_LEADERBOARD } = require("../constants");

const { NBQ_REDIS_PORT, NBQ_REDIS_HOST, NBQ_REDIS_PASSWORD, NBQ_REDIS_DB_INDEX } = process.env;

const client = redis.createClient(NBQ_REDIS_PORT, NBQ_REDIS_HOST, {
  password: NBQ_REDIS_PASSWORD,
});

client.on("connect", function () {
  client.select(NBQ_REDIS_DB_INDEX); // NBQ DB
  console.log(`Connected to NBQ Redis ON DB ${NBQ_REDIS_DB_INDEX}`);

  if (process.env.NODE_ENV === "production") {
    getNanoBrowserQuestLeaderboard();
  }
});

client.on("error", function (err) {
  Sentry.captureException(err);
});

const getNanoBrowserQuestPlayers = async () => {
  let res;

  try {
    client.get("total_players", (error, playerCount) => {
      nodeCache.set(NANOBROWSERQUEST_PLAYERS, { playerCount });
    });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err, { extra: { res } });
  }
};

const getNanoBrowserQuestLeaderboard = async () => {
  let res;
  try {
    let playersData = [];
    const PER_PAGES = 500;
    client.keys("u:*", async (_err, players) => {
      const playersChunks = chunk(players, PER_PAGES);

      for (let i = 0; i < playersChunks.length; i++) {
        const rawPlayerData = await Promise.all(
          playersChunks[i].map(
            player =>
              new Promise(resolve => {
                if (player === "u:running-coder") {
                  resolve(undefined);
                }

                client.hmget(
                  player,
                  "hash",
                  "network",
                  "exp",
                  "gold",
                  "goldStash",
                  (_err, reply) => {
                    const network = reply[1];
                    const exp = Number(reply[2] || 0);
                    const gold = Number(reply[3] || 0);
                    const goldStash = Number(reply[4] || 0);

                    if (network === "ban" || !exp) {
                      resolve(undefined);
                    } else {
                      resolve({
                        player: player.replace("u:", ""),
                        isCompleted: !!reply[0],
                        network,
                        exp: parseInt(reply[2] || 0),
                        gold: gold + goldStash,
                      });
                    }
                  },
                );
              }),
          ),
        );

        playersData = playersData.concat(rawPlayerData.filter(Boolean));
      }

      nodeCache.set(NANOBROWSERQUEST_LEADERBOARD, playersData);
    });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err, { extra: { res } });
  }
};

// Every 5 seconds
cron.schedule("*/5 * * * * *", async () => {
  getNanoBrowserQuestPlayers();
});

// Once every 15 minutes
// https://crontab.guru/#*/15_*_*_*_*
cron.schedule("*/15 * * * *", async () => {
  getNanoBrowserQuestLeaderboard();
});

if (!nodeCache.get(NANOBROWSERQUEST_LEADERBOARD)){
  getNanoBrowserQuestLeaderboard();
}
