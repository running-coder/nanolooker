const { client: redisClient } = require("../client/nbq-redis");
const { Sentry } = require("../sentry");
const { DELEGATORS } = require("../constants");

const PER_PAGE = 50;

const getTotal = account =>
  new Promise(async resolve => {
    redisClient.zcard(`DELEGATORS:${account}`, (err, total) => {
      if (err) Sentry.captureException(err);
      resolve(total);
    });
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
  new Promise(async resolve => {
    redisClient.keys(`${DELEGATORS}:*`, (err, res) => {
      if (err) {
        Sentry.captureException(err);
        return;
      }

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
  });

module.exports = {
  getDelegatorsPage,
  getAllDelegatorsCount,
};
