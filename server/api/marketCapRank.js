// const NodeCache = require("node-cache");
// const fetch = require("node-fetch");
// const { MARKET_CAP_RANK } = require("../constants");

// const marketCapCache = new NodeCache({
//   stdTTL: 3600,
//   deleteOnExpire: true
// });

// const getMarketCapRank = async () => {
//   let marketCapRank = marketCapCache.get(MARKET_CAP_RANK);

//   if (!marketCapRank) {
//     try {
//       const res = await fetch(
//         "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
//       );
//       ({ market_cap_rank: marketCapRank } = await res.json());
//     } catch (err) {
//       console.log(err);
//     }

//     marketCapCache.set(MARKET_CAP_RANK, marketCapRank);
//   }

//   return marketCapRank;
// };

// module.exports = {
//   marketCapCache,
//   getMarketCapRank
// };
