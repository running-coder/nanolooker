const { client: redisClient } = require("../client/redis");
const { Sentry } = require("../sentry");
const { REDIS_RICH_LIST } = require("../constants");

const PER_PAGE = 25;

const getRichListPage = async page =>
  new Promise(resolve => {
    const offset = (page - 1) * PER_PAGE;

    redisClient.zrevrange(
      REDIS_RICH_LIST,
      offset,
      offset + PER_PAGE,
      "WITHSCORES",
      (err, list) => {
        const accounts = [];
        list.forEach(value => {
          if (value.startsWith("nano_")) {
            accounts.push({ account: value });
          } else {
            accounts[accounts.length - 1].balance = parseFloat(value);
          }
        });

        if (err) Sentry.captureException(err);
        resolve(accounts);
      },
    );
  });

const getRichListAccount = async account =>
  new Promise(resolve => {
    redisClient.zrevrank(REDIS_RICH_LIST, account, async (err, rank) => {
      if (err) Sentry.captureException(err);
      if (typeof rank === "number") {
        const list = await getRichListPage(Math.ceil(rank / PER_PAGE));

        resolve({ rank, list });
      }
    });
  });

module.exports = {
  getRichListPage,
  getRichListAccount,
};
