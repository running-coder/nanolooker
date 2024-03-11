const { redisClient } = require("../client/redis");
const { Sentry } = require("../sentry");
const { REDIS_RICH_LIST } = require("../constants");

const PER_PAGE = 25;

const { NL_REDIS_DB_INDEX } = process.env;

const getTotal = async () => {
  const total = await redisClient.zCard(REDIS_RICH_LIST);

  console.log("~~~~total", total);
  return total;
};

const getRichListPage = async (page = 1) =>
  new Promise(async resolve => {
    await redisClient.select(NL_REDIS_DB_INDEX);
    const offset = (page - 1) * PER_PAGE;
    const total = await getTotal();

    const list = await redisClient.zrevrange(
      REDIS_RICH_LIST,
      offset,
      offset + PER_PAGE - 1,
      "WITHSCORES",
      (err, list) => {
        const data = [];
        list &&
          list.length &&
          list.forEach(value => {
            if (value.startsWith("nano_")) {
              data.push({ account: value });
            } else {
              data[data.length - 1].balance = parseFloat(value);
            }
          });

        if (err) Sentry.captureException(err);
        resolve({ data, meta: { total, perPage: PER_PAGE, offset } });
      },
    );
  });

const getRichListAccount = async account =>
  new Promise(resolve => {
    redisClient.zrevrank(REDIS_RICH_LIST, account, async (err, rank) => {
      if (err) Sentry.captureException(err);
      if (typeof rank === "number") {
        const data = await getRichListPage(Math.ceil(rank / PER_PAGE));

        resolve({ rank, ...data });
      }
    });
  });

module.exports = {
  getRichListPage,
  getRichListAccount,
};
