const cron = require("node-cron");
const fetch = require("node-fetch");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const { YOUTUBE_PLAYLIST } = require("../constants");

const { YOUTUBE_CREDENTIALS } = process.env;

const doYoutubePlaylist = async () => {
  const channels = {
    Nano: "UCFxXo3z9k4yvxSboEEjXO2w",
    JasonEsg: "UCuZP5pk5N5rkS9ChM4nJQPQ",
    NanoCollaborative: "UC5r23vImhUrpZZGYvcxrMvQ",
  };

  let videos = {};
  try {
    for (let i in channels) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_CREDENTIALS}&channelId=${channels[i]}&part=snippet,id&order=date&maxResults=15`,
      );
      const { items = [] } = await res.json();

      videos[i] = items;
    }

    nodeCache.set(YOUTUBE_PLAYLIST, videos);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return videos;
};

// https://crontab.guru/#0_0_*_*_*
// “At midnight.”
cron.schedule("0 0 * * *", async () => {
  if (process.env.NODE_ENV === "production") {
    doYoutubePlaylist();
  }
});

module.exports = {
  doYoutubePlaylist,
};
