const MongoClient = require("mongodb").MongoClient;
const { promises, existsSync } = require("fs");
const fse = require("fs-extra");
const { join } = require("path");
const fetch = require("node-fetch");
const cron = require("node-cron");
const BigNumber = require("bignumber.js");
const { Sentry } = require("../sentry");
const { nodeCache } = require("../client/cache");
const {
  MONGO_URL,
  MONGO_OPTIONS,
  MONGO_DB,
  COINGECKO_MARKET_STATS,
  COINGECKO_MARKET_CAP_STATS,
  COINGECKO_ALL_PRICE_STATS,
  COINGECKO_PRICE_STATS,
  SUPPORTED_CRYPTOCURRENCY,
  MARKET_CAP_STATS_COLLECTION,
} = require("../constants");

const defaultFiats = ["usd"];
const secondaryFiats = ["cad", "eur", "gbp", "cny", "jpy", "pln"];

const { writeFile, mkdir, copy } = promises;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const PUBLIC_ROOT_PATH = join(__dirname, "..", "..");
const LOGO_PATH = join(PUBLIC_ROOT_PATH, "public/cryptocurrencies/logo");
const DIST_LOGO_PATH = join(PUBLIC_ROOT_PATH, "dist/cryptocurrencies/logo");

let db;
let mongoClient;

const connect = async () =>
  await new Promise((resolve, reject) => {
    try {
      MongoClient.connect(MONGO_URL, MONGO_OPTIONS, (err, client) => {
        if (err) {
          throw err;
        }
        mongoClient = client;
        db = client.db(MONGO_DB);
        db.collection(MARKET_CAP_STATS_COLLECTION).createIndex({
          createdAt: 1,
        });
        resolve();
      });
    } catch (err) {
      console.log("Error", err);
      Sentry.captureException(err);
      reject();
    }
  });

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
  await connect();
  await mkdir(LOGO_PATH, { recursive: true });

  const marketCapStats = [];
  const ids = [];
  const top = process.env.NODE_ENV === "production" ? 100 : 10;

  try {
    let res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${top}&page=1&sparkline=false&market_data=false`,
    );

    const cryptocurrencies = await res.json();

    // If nano is excluded from the top X, still include it to be requested
    if (!cryptocurrencies.find(({ id }) => id === "nano")) {
      cryptocurrencies.push({ id: "nano", symbol: "xno", name: "Nano" });
    }

    for (let i = 0; i < cryptocurrencies.length; i++) {
      const { id, symbol, name } = cryptocurrencies[i];

      ids.push(id);
      res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?tickers=false&sparkline=false`,
      );

      try {
        const {
          market_data: {
            market_cap: { usd: marketCap },
          },
          market_cap_rank: marketCapRank,
          image: { small: image },
          fully_diluted_valuation: fullyDilutedValuation,
          community_data: {
            twitter_followers: twitterFollowers,
            reddit_subscribers: redditSubscribers,
          },
          developer_data: { stars: githubStars },
        } = await res.json();

        const cryptocurrency = {
          id,
          symbol,
          name,
          image,
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
        };

        marketCapStats.push(cryptocurrency);
        await db.collection(MARKET_CAP_STATS_COLLECTION).findOneAndUpdate(
          {
            id,
          },
          {
            $set: cryptocurrency,
          },
          { upsert: true },
        );

        try {
          const logoPath = join(LOGO_PATH, `${symbol}.png`);

          if (!existsSync(logoPath)) {
            const response = await fetch(image);
            const buffer = await response.buffer();
            writeFile(logoPath, buffer);
          }
        } catch (err) {
          console.error(err);
        }

        console.log(`Fetched ${i}: ${id}`);
      } catch (err1) {
        console.log(`Err Fetching ${i}: ${id}`, err1);
        Sentry.captureException(err1);
      }

      // CoinGecko rate limit is 10 calls per seconds
      if (i && !(i % 10)) {
        await sleep(3500);
      } else {
        await sleep(process.env.NODE_ENV === "production" ? 1000 : 150);
      }
    }

    // Delete entries that are gone from the top 150
    await db.collection(MARKET_CAP_STATS_COLLECTION).deleteMany({
      id: { $nin: ids },
    });

    mongoClient.close();

    nodeCache.set(COINGECKO_MARKET_CAP_STATS, marketCapStats);

    fse.copy(LOGO_PATH, DIST_LOGO_PATH);
  } catch (err) {
    console.log("Error", err);
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
  getMarketCapStats();
}
