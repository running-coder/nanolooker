const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const MongoClient = require("mongodb").MongoClient;
const {
  EXPIRE_1h,
  EXPIRE_24H,
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  COINGECKO_STATS,
  MARKET_CAP_RANK_24H,
  MARKET_CAP_RANK_COLLECTION
} = require("../constants");

const apiCache = new NodeCache({
  stdTTL: 15,
  deleteOnExpire: true
});

const getCoingeckoStats = async () => {
  let coingeckoStats = apiCache.get(COINGECKO_STATS);
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
          apiCache.set(MARKET_CAP_RANK_24H, value, EXPIRE_1h);
        });
    });
  }

  if (!coingeckoStats) {
    try {
      const resBtcPrice = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum&vs_currencies=usd&include_24hr_change=true"
      );

      const {
        bitcoin: { usd: usdBtcCurrentPrice, usd_24h_change: usdBtc24hChange },
        ethereum: { usd: usdEthCurrentPrice, usd_24h_change: usdEth24hChange }
      } = await resBtcPrice.json();

      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true"
      );

      const {
        market_cap_rank: marketCapRank,
        market_data: {
          market_cap_change_percentage_24h: marketCapChangePercentage24h,
          market_cap: { usd: usdMarketCap },
          total_volume: { usd: usd24hVolume },
          current_price: { usd: usdCurrentPrice },
          price_change_percentage_24h: usd24hChange,
          total_supply: totalSupply,
          circulating_supply: circulatingSupply
        }
      } = await res.json();

      coingeckoStats = {
        marketCapRank,
        marketCapRank24h,
        usdMarketCap,
        marketCapChangePercentage24h,
        usd24hVolume,
        totalSupply,
        circulatingSupply,
        usdCurrentPrice,
        usd24hChange,
        usdBtcCurrentPrice,
        usdBtc24hChange,
        usdEthCurrentPrice,
        usdEth24hChange
      };

      apiCache.set(COINGECKO_STATS, coingeckoStats);
    } catch (e) {}
  }

  return { coingeckoStats };
};

module.exports = {
  apiCache,
  getCoingeckoStats
};
