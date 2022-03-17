const MongoClient = require("mongodb").MongoClient;
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const {
  EXPIRE_1h,
  EXPIRE_24H,
  EXPIRE_48H,
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  COINGECKO_MARKET_STATS,
  COINGECKO_MARKET_CAP_STATS,
  COINGECKO_ALL_PRICE_STATS,
  COINGECKO_PRICE_STATS,
  MARKET_CAP_RANK_24H,
  MARKET_CAP_RANK_COLLECTION,
  MARKET_CAP_STATS_COLLECTION,
} = require("../constants");

const DEFAULT_FIAT = "usd";

const allowedFiats = ["usd", "cad", "eur", "gbp", "cny", "jpy", "pln"];

const getCoingeckoStats = async ({ fiat, cryptocurrency }) => {
  fiat = allowedFiats.includes(fiat) ? fiat : DEFAULT_FIAT;

  let marketStats = nodeCache.get(`${COINGECKO_MARKET_STATS}-${fiat}`) || {};
  let priceStats =
    cryptocurrency === "true"
      ? nodeCache.get(`${COINGECKO_ALL_PRICE_STATS}-${fiat}`)
      : nodeCache.get(`${COINGECKO_PRICE_STATS}-${fiat}`);

  let marketCapRank24h = nodeCache.get(MARKET_CAP_RANK_24H);

  const getMarketCapRank24h =
    marketCapRank24h ||
    new Promise((resolve, reject) => {
      let db;
      try {
        MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
          if (err) {
            throw err;
          }
          db = client.db(MONGO_DB);

          db.collection(MARKET_CAP_RANK_COLLECTION)
            .find({
              $query: {
                createdAt: {
                  $lte: new Date(Date.now() - EXPIRE_24H * 1000),
                  $gte: new Date(Date.now() - EXPIRE_48H * 1000),
                },
              },
              $orderby: { value: 1 },
            })
            .toArray((_err, [{ value } = {}] = []) => {
              nodeCache.set(MARKET_CAP_RANK_24H, value, EXPIRE_1h);
              client.close();
              resolve(value);
            });
        });
      } catch (err) {
        console.log("Error", err);
        Sentry.captureException(err);
        resolve();
      }
    });

  [marketCapRank24h, marketStats, priceStats] = await Promise.all([
    getMarketCapRank24h,
    marketStats,
    priceStats,
  ]);

  return {
    marketStats: Object.assign(marketStats, { marketCapRank24h }),
    priceStats,
  };
};

const getCoingeckoMarketCapStats = async () => {
  let marketCapStats = nodeCache.get(COINGECKO_MARKET_CAP_STATS);

  if (marketCapStats) {
    return marketCapStats;
  }

  return new Promise(resolve => {
    let db;
    try {
      MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
        if (err) {
          throw err;
        }
        db = client.db(MONGO_DB);

        db.collection(MARKET_CAP_STATS_COLLECTION)
          .find()
          .toArray((_err, value = []) => {
            nodeCache.set(COINGECKO_MARKET_CAP_STATS, value);
            client.close();
            resolve(value);
          });
      });
    } catch (err) {
      console.log("Error", err);
      Sentry.captureException(err);
      resolve([]);
    }
  });
};

module.exports = {
  getCoingeckoStats,
  getCoingeckoMarketCapStats,
};
