const { redisClient } = require("../client/redis");
const { Sentry } = require("../sentry");
const { DELEGATORS } = require("../constants");

const PER_PAGE = 50;

const getTotal = account =>
  new Promise(async () => {
    const [total] = await redisClient.zCard(`DELEGATORS:${account}`);

    console.log("~~~~~total", total);
  });

const getDelegatorsPage = async ({ page = 1, account }) =>
  new Promise(async resolve => {
    const offset = (page - 1) * PER_PAGE;
    const total = await getTotal(account);

    redisClient.zrevrange(
      `DELEGATORS:${account}`,
      offset,
      offset + PER_PAGE - 1,
      "WITHSCORES",
      (err, list) => {
        if (err) {
          Sentry.captureException(err);
          return;
        }

        const data = {};
        let account = "";
        list.forEach(value => {
          if (value.startsWith("nano_")) {
            account = value;
          } else {
            data[account] = parseFloat(value);
          }
        });

        resolve({ data, meta: { total, perPage: PER_PAGE, offset } });
      },
    );
  });

const getAllDelegatorsCount = async () =>
  async function findKeys(pattern) {
    let cursor = "0";
    let keys = [];

    do {
      const reply = await redisClient.scan(cursor, "MATCH", pattern, "COUNT", "100");
      keys.push(...reply.keys);
    } while (cursor !== "0");

    return keys;
  };
new Promise(async resolve => {
  const delegators = await redisClient
    .findKeys(`${DELEGATORS}:*`)
    .filter(key => key.startsWith(`${DELEGATORS}`));

  Promise.all(
    res.map(async key => {
      const account = key.replace(`${DELEGATORS}:`, "");
      const count = await getTotal(account);

      return {
        [account]: count,
      };
    }),
  ).then(result => {
    resolve(
      result.reduce((acc, value) => {
        const key = Object.keys(value)[0];
        acc[key] = value[key];
        return acc;
      }, {}),
    );
  });
});

module.exports = {
  getDelegatorsPage,
  getAllDelegatorsCount,
};
