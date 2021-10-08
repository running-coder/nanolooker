const fetch = require("node-fetch");
const cron = require("node-cron");
const BigNumber = require("bignumber.js");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const {
  COINGECKO_MARKET_STATS,
  COINGECKO_MARKET_CAP_STATS,
  COINGECKO_ALL_PRICE_STATS,
  COINGECKO_PRICE_STATS,
  SUPPORTED_CRYPTOCURRENCY,
} = require("../constants");

const defaultFiats = ["usd"];
const secondaryFiats = ["cad", "eur", "gbp", "cny", "jpy"];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getPriceStats = async fiats => {
  let res;
  try {
    const ids = SUPPORTED_CRYPTOCURRENCY.map(({ id }) => id).join(",");

    for (let i = 0; i < fiats.length; i++) {
      const fiat = fiats[i];
      const resPrices = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${fiat}&include_24hr_change=true`,
      );
      const json = await resPrices.json();

      nodeCache.set(`${COINGECKO_ALL_PRICE_STATS}-${fiat}`, json);
      nodeCache.set(`${COINGECKO_PRICE_STATS}-${fiat}`, {
        bitcoin: json.bitcoin,
        nano: json.nano,
      });
    }
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err, { extra: { res } });
  }
};

const getMarketStats = async fiats => {
  let res;
  try {
    for (let i = 0; i < fiats.length; i++) {
      const fiat = fiats[i];
      res = await fetch(
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
    }
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err, { extra: { res } });
  }
};

const getMarketCapStats = async () => {
  const marketCapStats = [];
  const top = process.env.NODE_ENV === "production" ? 150 : 1;

  try {
    // @NOTE top 150
    let res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${top}&page=1&sparkline=false`,
    );

    const cryptocurrencies = await res.json();

    for (let i = 0; i < cryptocurrencies.length; i++) {
      const {
        id,
        symbol,
        name,
        image,
        market_cap: marketCap,
        market_cap_rank: marketCapRank,
        fully_diluted_valuation: fullyDilutedValuation,
      } = cryptocurrencies[i];
      res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?tickers=false&market_data=false&sparkline=false`,
      );

      try {
        const {
          community_data: {
            twitter_followers: twitterFollowers,
            reddit_subscribers: redditSubscribers,
          },
          developer_data: { stars: githubStars },
        } = await res.json();

        marketCapStats.push({
          id,
          symbol,
          name,
          image: image.replace("/large/", "/small/"),
          marketCap,
          marketCapRank,
          fullyDilutedValuation,
          twitterFollowers,
          redditSubscribers,
          githubStars,
          twitterFollowersPerBillion: twitterFollowers
            ? new BigNumber(1_000_000_000)
                .times(twitterFollowers)
                .dividedBy(marketCap)
                .integerValue()
                .toNumber()
            : null,
          redditSubscribersPerBillion: redditSubscribers
            ? new BigNumber(1_000_000_000)
                .times(redditSubscribers)
                .dividedBy(marketCap)
                .integerValue()
                .toNumber()
            : null,
          githubStarsPerBillion: githubStars
            ? new BigNumber(1_000_000_000)
                .times(githubStars)
                .dividedBy(marketCap)
                .integerValue()
                .toNumber()
            : null,
        });

        console.log(`Fetched ${i}: ${id}`);
      } catch (err1) {
        console.log(`Err Fetching ${i}: ${id}`);
        Sentry.captureException(err1);
      }

      // CoinGecko rate limit is 10 calls per seconds
      if (i && !(i % 10)) {
        await sleep(3500);
      } else {
        await sleep(process.env.NODE_ENV === "production" ? 750 : 0);
      }
    }

    nodeCache.set(COINGECKO_MARKET_CAP_STATS, marketCapStats);
  } catch (err) {
    Sentry.captureException(err);
  }
};

// https://crontab.guru/every-day-at-1am
// “At 01:00.”
cron.schedule("0 1 * * *", async () => {
  getMarketCapStats();
});

// Every 30 seconds
cron.schedule("*/30 * * * * *", async () => {
  getPriceStats(defaultFiats);
  getMarketStats(defaultFiats);
});

// https://crontab.guru/#*/2_*_*_*_*
// At every 2nd minute.
cron.schedule("*/2 * * * *", async () => {
  getPriceStats(secondaryFiats);
  getMarketStats(secondaryFiats);
});

getPriceStats(defaultFiats);
getMarketStats(defaultFiats);

if (process.env.NODE_ENV === "production") {
  getPriceStats(secondaryFiats);
  getMarketStats(secondaryFiats);
}

getMarketCapStats();
