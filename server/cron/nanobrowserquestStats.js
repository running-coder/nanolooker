const cron = require("node-cron");
const redis = require("redis");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const {
  NANOBROWSERQUEST_PLAYERS,
  NANOBROWSERQUEST_LEADERBOARD,
} = require("../constants");

const {
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_NBQ_DB_INDEX,
} = process.env;
const client = redis.createClient(REDIS_PORT, REDIS_HOST, {
  password: REDIS_PASSWORD,
});

client.on("connect", function () {
  client.select(REDIS_NBQ_DB_INDEX); // NBQ DB
  console.log("Connected to Redis");
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
    client.keys("u:*", (error, players) => {
      Promise.all(
        players.map(
          player =>
            new Promise(resolve => {
              client.hmget(
                player,
                "hash",
                "nanoPotions",
                "exp",
                // "account",
                (error, reply) => {
                  resolve({
                    player: player.replace("u:", ""),
                    isCompleted: !!reply[0],
                    nanoPotions: parseInt(reply[1] || 0),
                    exp: parseInt(reply[2] || 0),
                    // account: reply[3],
                  });
                },
              );
            }),
        ),
      ).then(data => {
        nodeCache.set(NANOBROWSERQUEST_LEADERBOARD, data);
      });
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

if (process.env.NODE_ENV === "production") {
  getNanoBrowserQuestLeaderboard();
}
