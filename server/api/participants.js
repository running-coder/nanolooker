const { client: redisClient } = require("../client/redis");
const { Sentry } = require("../sentry");
const { PARTICIPANTS } = require("../constants");

const PER_PAGE = 25;

const getTotal = () =>
  new Promise(async resolve => {
    redisClient.zcard(PARTICIPANTS, (err, total) => {
      if (err) Sentry.captureException(err);
      resolve(total);
    });
  });

const getParticipantsPage = async (page = 1) =>
  new Promise(async resolve => {
    const offset = (page - 1) * PER_PAGE;
    const total = await getTotal();

    redisClient.zrevrange(PARTICIPANTS, offset, offset + PER_PAGE - 1, (err, accounts) => {
      Promise.all(
        accounts.map(
          account =>
            new Promise(async resolve => {
              redisClient.hgetall(`${PARTICIPANTS}:${account}`, (error, reply) => {
                resolve({ account, ...reply });
              });
            }),
        ),
      ).then(data => {
        resolve({ data, meta: { total, perPage: PER_PAGE, offset } });
      });
    });
  });

const getParticipant = async account =>
  new Promise(async resolve => {
    redisClient.hgetall(`${PARTICIPANTS}:${account}`, (error, reply) => {
      if (!reply) {
        resolve({});
      } else {
        resolve({ account, ...reply });
      }
    });
  });

module.exports = {
  getParticipant,
  getParticipantsPage,
};
