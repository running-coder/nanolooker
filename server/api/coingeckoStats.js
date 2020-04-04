const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const MongoClient = require("mongodb").MongoClient;
const {
  EXPIRE_1h,
  EXPIRE_24H,
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  COINGECKO_MARKET_STATS,
  COINGECKO_PRICE_STATS,
  MARKET_CAP_RANK_24H,
  MARKET_CAP_RANK_COLLECTION,
  SUPPORTED_CRYPTOCURRENCY
} = require("../constants");

const apiCache = new NodeCache({
  stdTTL: 15,
  deleteOnExpire: true
});

const DEFAULT_FIAT = "usd";

const allowedFiats = ["usd", "cad", "eur", "gbp", "cny", "jpy"];

const getCoingeckoStats = async ({ fiat }) => {
  fiat = allowedFiats.includes(fiat) ? fiat : DEFAULT_FIAT;

  let marketStats = apiCache.get(`${COINGECKO_MARKET_STATS}-${fiat}`);
  let priceStats = apiCache.get(`${COINGECKO_PRICE_STATS}-${fiat}`);
  let marketCapRank24h = apiCache.get(MARKET_CAP_RANK_24H);

  if (!marketCapRank24h) {
    let db;
    MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (_err, client) => {
      if (_err) {
        throw _err;
      }
      db = client.db(MONGO_DB);

      db.collection(MARKET_CAP_RANK_COLLECTION)
        .find({
          $query: {
            createdAt: {
              $lte: new Date(Date.now() - EXPIRE_24H * 1000)
            }
          },
          $orderby: { createdAt: 1 }
        })
        .toArray((_err, [{ value } = {}] = []) => {
          marketCapRank24h = value;
          apiCache.set(MARKET_CAP_RANK_24H, value, EXPIRE_1h);
        });
    });
  }

  if (!marketStats) {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true"
      );

      const {
        market_cap_rank: marketCapRank,
        market_data: {
          market_cap_change_percentage_24h: marketCapChangePercentage24h,
          market_cap: { [fiat]: marketCap },
          total_volume: { [fiat]: volume24h },
          current_price: { [fiat]: currentPrice },
          price_change_percentage_24h: change24h,
          total_supply: totalSupply,
          circulating_supply: circulatingSupply
        }
      } = await res.json();

      marketStats = {
        marketCapRank,
        marketCapRank24h,
        marketCap,
        marketCapChangePercentage24h,
        volume24h,
        totalSupply,
        circulatingSupply,
        currentPrice,
        change24h
      };

      apiCache.set(`${COINGECKO_MARKET_STATS}-${fiat}`, marketStats);
    } catch (e) {}
  }

  if (!priceStats) {
    try {
      const ids = SUPPORTED_CRYPTOCURRENCY.map(({ id }) => id).join(",");

      const resPrices = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${fiat}&include_24hr_change=true`
      );
      priceStats = await resPrices.json();

      apiCache.set(`${COINGECKO_PRICE_STATS}-${fiat}`, priceStats);
    } catch (e) {}
  }

  return { marketCapRank24h, marketStats, priceStats };
};

module.exports = {
  apiCache,
  getCoingeckoStats
};
