const { nodeCache } = require("../client/cache");
const { YOUTUBE_PLAYLIST } = require("../constants");
const { doYoutubePlaylist } = require("../cron/youtubePlaylist");

const getYoutubePlaylist = async () => {
  let youtubePlaylist = nodeCache.get(YOUTUBE_PLAYLIST) || (await doYoutubePlaylist());

  return youtubePlaylist;
};

module.exports = {
  getYoutubePlaylist,
};
