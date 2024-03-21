const cron = require("node-cron");
const chunk = require("lodash/chunk");
const { nodeCache } = require("../client/cache");
const { redisClient } = require("../client/redis");

const {
  NANOBROWSERQUEST_ONLINE_PLAYERS,
  NANOBROWSERQUEST_LEADERBOARD,
  EXPIRE_1H,
} = require("../constants");

const { NBQ_REDIS_DB_INDEX } = process.env;

const getNanoBrowserQuestPlayers = async () => {
  const playerCount = await redisClient.get("total_players");
  nodeCache.set(NANOBROWSERQUEST_ONLINE_PLAYERS, { playerCount });
};

const getNanoBrowserQuestLeaderboard = async () => {
  await redisClient.select(NBQ_REDIS_DB_INDEX);

  async function scanAllKeys(pattern = "*") {
    let cursor = 0; // Initialize cursor as a number
    let keys = [];

    do {
      // Await the SCAN operation with the current cursor
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = result.cursor;
      keys = keys.concat(result.keys.filter(key => key.startsWith("u:")));
    } while (cursor !== 0);
    return keys;
  }

  let playersData = [];
  const PER_PAGES = 500;
  // Usage
  // const players = (await findKeys("u:*")).filter(key => key.startsWith("u:"));

  const players = await scanAllKeys(); //.filter(key => key.startsWith("u:"));
  const playersChunks = chunk(players, PER_PAGES);

  for (let i = 0; i < playersChunks.length; i++) {
    const rawPlayerData = await Promise.all(
      playersChunks[i].map(
        player =>
          new Promise(async resolve => {
            const userKey = player;
            let [hash, network, exp, gold, goldStash] = await redisClient
              .multi()
              .hGet(userKey, "hash")
              .hGet(userKey, "network")
              .hGet(userKey, "exp")
              .hGet(userKey, "gold")
              .hGet(userKey, "goldStash")
              .exec();

            exp = Number(exp || 0);
            gold = Number(gold || 0);
            goldStash = Number(goldStash || 0);

            if (network === "ban" || exp <= 1000) {
              resolve(undefined);
            } else {
              resolve({
                player: player.replace("u:", ""),
                isCompleted: !!hash,
                network,
                exp,
                gold: gold + goldStash,
              });
            }
          }),
      ),
    );

    playersData = playersData.concat(rawPlayerData.filter(Boolean));
  }
  nodeCache.set(NANOBROWSERQUEST_LEADERBOARD, playersData, EXPIRE_1H);
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

if (!nodeCache.get(NANOBROWSERQUEST_LEADERBOARD)) {
  getNanoBrowserQuestLeaderboard();
}
