const fs = require("fs");
const util = require("util");
const { join } = require("path");
// const rimraf = require("rimraf");
const NodeCache = require("node-cache");
const cron = require("node-cron");
const { Sentry } = require("../sentry");
const { EXPIRE_24H, DELEGATORS, STATUS } = require("../constants");
const { rawToRai } = require("../utils");
const { rpc } = require("../rpc");
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);

const delegatorsCache = new NodeCache({
  stdTTL: EXPIRE_24H,
  deleteOnExpire: true,
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const DELEGATORS_FOLDER = join(__dirname, "../data/delegators/");
const DELEGATORS_PATH = join(DELEGATORS_FOLDER, "delegators.json");
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
    console.log(`Getting Delegators for ${account}`);
    const { delegators } = await rpc("delegators", {
      account,
    });

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

    allDelegators[account] = {
      weight: filteredRepresentatives[i].weight,
      delegators: filteredDelegators,
    };

    // Heavy, need to wait a bit before the next one
    sleep(10000);
    fs.writeFileSync(DELEGATORS_PATH, JSON.stringify(allDelegators, null, 2));
    sleep(10000);
  }

  return allDelegators;
};

const doDelegatorsCron = async () => {
  await mkdir(`${DELEGATORS_FOLDER}`, { recursive: true });

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

    delegatorsCache.set(DELEGATORS, delegators);
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
  // doDelegatorsCron();
});

// if (
// process.env.NODE_ENV === "production" &&
// !fs.existsSync(DELEGATORS_PATH) &&
// !fs.existsSync(STATUS_PATH)
// ) {
// doDelegatorsCron();
// }

const getDelegatorsData = () => {
  let delegators = delegatorsCache.get(DELEGATORS);
  let status = delegatorsCache.get(STATUS);

  if (!delegators) {
    delegators = fs.existsSync(DELEGATORS_PATH)
      ? JSON.parse(fs.readFileSync(DELEGATORS_PATH, "utf8"))
      : [];
    delegatorsCache.set(DELEGATORS, delegators);
  }

  if (!status) {
    status = fs.existsSync(STATUS_PATH)
      ? JSON.parse(fs.readFileSync(STATUS_PATH, "utf8"))
      : {};
    delegatorsCache.set(STATUS, status);
  }

  return {
    status,
    delegators,
  };
};

module.exports = {
  getDelegatorsData,
};
