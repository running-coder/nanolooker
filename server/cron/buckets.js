const cron = require("node-cron");
const { rpc } = require("../rpc");
// const { nodeCache } = require("../cache");
// const {  } = require("../constants");

// Source: https://www.reddit.com/r/nanocurrency/comments/myf9c2/all_129_prioritization_buckets_in_nano/
// Bucket 000: 0.000000000000000000000000000000 Nano
// Bucket 001: 0.000000000000000000000000000001 Nano
// Bucket 002: 0.000000000000000000000000000002 Nano
// Bucket 003: 0.000000000000000000000000000004 Nano
// Bucket 004: 0.000000000000000000000000000008 Nano
// Bucket 005: 0.000000000000000000000000000016 Nano
// Bucket 006: 0.000000000000000000000000000032 Nano
// Bucket 007: 0.000000000000000000000000000064 Nano
// Bucket 008: 0.000000000000000000000000000128 Nano
// Bucket 009: 0.000000000000000000000000000256 Nano
// Bucket 010: 0.000000000000000000000000000512 Nano
// ...
// Bucket 126: 42535295.865117307932921825928971026432 Nano
// Bucket 127: 85070591.730234615865843651857942052864 Nano
// Bucket 128: 170141183.460469231731687303715884105728 Nano

const buckets = new Array(129).fill(0);
// key: root, value: bucketIndex
const roots = {};

let previousRoots = [];

const getDiff = (base, compare) => {
  const union = [];
  const diff = !base.length ? compare : [];

  if (!diff.length) {
    let i = 0;
    let length = compare.length;
    while (i < length) {
      const value = compare[i];
      const baseIndex = base.indexOf(value);

      if (baseIndex > -1) {
        // Data still in cache
        union.push(value);
        base[baseIndex] = undefined;
      } else {
        diff.push(value);
      }

      i++;
    }

    // Delete the remaining base items that were not in union
    i = 0;
    base = base.filter(Boolean);
    length = base.length;
    while (i < length) {
      const value = base[i];
      const bucketIndex = roots[value];
      buckets[bucketIndex]--;
      delete roots[value];

      i++;
    }
  }

  return { union, diff };
};

const doBuckets = async () => {
  const startTime = new Date();
  const { confirmations, unconfirmed, confirmed } = await rpc(
    "confirmation_active",
  );

  const { union, diff } = getDiff(previousRoots, confirmations);
  previousRoots = union.concat(diff);

  let cachedRootsCount = 0;

  for (let i = 0; i < diff.length; i++) {
    const root = diff[i];
    console.log("~~~i", i);

    // @TODO Find a way to batch them? 1 by 1 with awaits is too long... (.then() and sleep after X?)
    const { last_winner: lastWinner, blocks } = await rpc("confirmation_info", {
      json_block: true,
      root,
    });

    if (
      !lastWinner ||
      !blocks ||
      !blocks[lastWinner] ||
      !blocks[lastWinner].contents
    ) {
      // Expired block;
      continue;
    }

    const balance = parseInt(blocks[lastWinner].contents.balance);
    const bucketIndex = balance ? Math.ceil(Math.log2(balance) + 1) : 0;

    buckets[bucketIndex]++;
    roots[root] = bucketIndex;
  }

  let bucketCount = 0;
  buckets.forEach(count => (bucketCount += count));

  console.log("~~~cachedRootsCount", cachedRootsCount);
  console.log("~~~bucketCount", bucketCount);
  console.log("~~~confirmations.length", confirmations.length);

  console.log(`doBuckets cron finished in ${(new Date() - startTime) / 1000}s`);
};

// Every 3 seconds
// cron.schedule("* * * * *", () => {
//   doBuckets();
// });

// doBuckets();
