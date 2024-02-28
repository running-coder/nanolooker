const cron = require("node-cron");
const  { redisClient }  = require("../client/nbq-redis");

const chunk = require("lodash/chunk");
const { nodeCache } = require("../client/cache");
const { NANOBROWSERQUEST_PLAYERS, NANOBROWSERQUEST_LEADERBOARD } = require("../constants");
const client = redisClient();

const getNanoBrowserQuestOnlinePlayers = async () => {
  const playerCount = await client.get("total_players");
  nodeCache.set(NANOBROWSERQUEST_PLAYERS, playerCount);
};

const getNanoBrowserQuestLeaderboard = async () => {
  let playersData = [];
  const PER_PAGES = 500;
  const playerNames = await client.keys("u:*");
  const playersChunks = chunk(playerNames, PER_PAGES);
  
  for (let i = 0; i < playersChunks.length; i++) {
    const rawPlayerData = await Promise.all(playersChunks[i].map(async (player) => {
      // Assuming player is equivalent to userKey in your original code
      if (player === "u:running-coder") {
        return undefined;
      }

      let [hash, network, exp, gold, goldStash] = await client
        .multi()
        .hGet(player, "hash") // 0
        .hGet(player, "network") // 1
        .hGet(player, "exp") // 2
        .hGet(player, "gold") // 3
        .hGet(player, "goldStash") // 4
        .exec();

      exp = Number(exp || 0);
      gold = Number(gold || 0);
      goldStash = Number(goldStash || 0);

      if (network === "ban" || !exp) {
        return undefined;
      } else {
        return {
          player: player.replace("u:", ""),
          isCompleted: !!hash,
          network,
          exp,
          gold: gold + goldStash,
        };
      }
    }));

    playersData = playersData.concat(rawPlayerData.filter(Boolean));
  }

  // Do something with playersData, like return it or log it
  return playersData.filter(Boolean); // This filters out any undefined entries
};


playersData = playersData.concat(rawPlayerData.filter(Boolean));

nodeCache.set(NANOBROWSERQUEST_LEADERBOARD, playersData);

// Every 5 seconds
cron.schedule("*/5 * * * * *", async () => {
  getNanoBrowserQuestOnlinePlayers();
});

// Once every 15 minutes
// https://crontab.guru/#*/15_*_*_*_*
cron.schedule("*/15 * * * *", async () => {
  getNanoBrowserQuestLeaderboard();
});

if (!nodeCache.get(NANOBROWSERQUEST_LEADERBOARD) && client.isOpen) {

  console.log('~~~~~ do getNanoBrowserQuestLeaderboard')
  getNanoBrowserQuestLeaderboard();
}
