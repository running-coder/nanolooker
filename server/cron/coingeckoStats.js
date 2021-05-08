const fetch = require("node-fetch");
const cron = require("node-cron");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../cache");
const {
  COINGECKO_MARKET_STATS,
  COINGECKO_ALL_PRICE_STATS,
  COINGECKO_PRICE_STATS,
  SUPPORTED_CRYPTOCURRENCY,
} = require("../constants");

const allowedFiats = ["usd", "cad", "eur", "gbp", "cny", "jpy"];

const getPriceStats = async () => {
  try {
    const ids = SUPPORTED_CRYPTOCURRENCY.map(({ id }) => id).join(",");

    allowedFiats.forEach(async fiat => {
      const resPrices = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${fiat}&include_24hr_change=true`,
      );
      const json = await resPrices.json();

      nodeCache.set(`${COINGECKO_ALL_PRICE_STATS}-${fiat}`, json);
      nodeCache.set(`${COINGECKO_PRICE_STATS}-${fiat}`, {
        bitcoin: json.bitcoin,
        nano: json.nano,
      });
    });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

const getMarketStats = async () => {
  try {
    allowedFiats.forEach(async fiat => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true",
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
          circulating_supply: circulatingSupply,
        },
      } = await res.json();

      const marketStats = {
        marketCapRank,
        marketCap,
        marketCapChangePercentage24h,
        volume24h,
        totalSupply,
        circulatingSupply,
        currentPrice,
        change24h,
      };

      nodeCache.set(`${COINGECKO_MARKET_STATS}-${fiat}`, marketStats);
    });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }
};

// Every 15 seconds
cron.schedule("*/15 * * * * *", async () => {
  getPriceStats();
  getMarketStats();
});

getPriceStats();
getMarketStats();
