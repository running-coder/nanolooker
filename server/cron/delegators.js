const fs = require("fs");
const util = require("util");
const { join } = require("path");
// const rimraf = require("rimraf");
const cron = require("node-cron");
const { nodeCache } = require("../client/cache");
const { Sentry } = require("../sentry");
const { EXPIRE_1W, DELEGATORS } = require("../constants");
const { rawToRai } = require("../utils");
const { rpc } = require("../rpc");
const mkdir = util.promisify(fs.mkdir);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const ROOT_FOLDER = join(__dirname, "../data/");
const DELEGATORS_FOLDER = join(__dirname, "../data/delegators/");
const DELEGATORS_PATH = join(ROOT_FOLDER, "delegators.json");
const TMP_DELEGATORS_PATH = join(__dirname, "../data/tmp/delegators");
const STATUS_PATH = join(DELEGATORS_FOLDER, "status.json");
// Amounts below will be ignored
const MIN_REPRESENTATIVE_WEIGHT = 100000;
const MIN_DELEGATOR_WEIGHT = 1;

const getAccountDelegators = async () => {
  console.log("Getting Representatives");
  const { representatives } = await rpc("representatives");

  const filteredRepresentatives = representatives.filter(
    ({ weight }) => weight >= MIN_REPRESENTATIVE_WEIGHT,
  );

  const allDelegators = {};

  for (let i = 0; i < filteredRepresentatives.length; i++) {
    const account = filteredRepresentatives[i].account;

    // Skip, too many delegators
    if (
      account ===
      "nano_3arg3asgtigae3xckabaaewkx3bzsh7nwz7jkmjos79ihyaxwphhm6qgjps4"
    )
      continue;

    console.log(`Getting Delegators for ${account}`);
    const { delegators } = await rpc("delegators", {
      account,
    });

    if (Object.keys(delegators).length) {
      const filteredDelegators = Object.entries(delegators).reduce(
        (acc, [account, rawWeight]) => {
          const weight = rawToRai(rawWeight);
          if (weight > MIN_DELEGATOR_WEIGHT) {
            acc[account] = weight;
          }
          return acc;
        },
        {},
      );

      const sortedDelegators = Object.fromEntries(
        Object.entries(filteredDelegators).sort((a, b) => b[1] - a[1]),
      );

      const trimmedDelegators = Object.fromEntries(
        Object.entries(sortedDelegators).slice(0, 100),
      );

      fs.writeFileSync(
        `${DELEGATORS_FOLDER}/${account}.json`,
        JSON.stringify(trimmedDelegators, null, 2),
      );

      allDelegators[account] = Object.keys(filteredDelegators).length;
      // Heavy, need to wait a bit before the next one
      sleep(3000);
    }
  }

  return allDelegators;
};

const doDelegatorsCron = async () => {
  await mkdir(`${DELEGATORS_FOLDER}`, { recursive: true });
  await mkdir(`${TMP_DELEGATORS_PATH}`, { recursive: true });

  const startTime = new Date();
  console.log("Delegators cron started");
  try {
    const delegators = await getAccountDelegators();

    fs.writeFileSync(DELEGATORS_PATH, JSON.stringify(delegators, null, 2));
    fs.writeFileSync(
      STATUS_PATH,
      JSON.stringify(
        {
          executionTime: (new Date() - startTime) / 1000,
          date: new Date(),
        },
        null,
        2,
      ),
    );

    nodeCache.set(DELEGATORS, delegators, EXPIRE_1W);
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  console.log(
    `Delegators cron finished in ${(new Date() - startTime) / 1000}s`,
  );
};

// https://crontab.guru/#0_2_*_*_0
// “At 02:00 on Sunday.”
cron.schedule("0 2 * * 0", async () => {
  if (process.env.NODE_ENV !== "production") return;
  doDelegatorsCron();
});

// if (
// process.env.NODE_ENV === "production" &&
// !fs.existsSync(DELEGATORS_PATH) &&
// !fs.existsSync(STATUS_PATH)
// ) {
// doDelegatorsCron();
// }
