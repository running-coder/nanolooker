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

const ROOT_FOLDER = join(__dirname, "../data/");
const DELEGATORS_FOLDER = join(__dirname, "../data/delegators/");
const DELEGATORS_PATH = join(DELEGATORS_FOLDER, "delegators.json");
const TMP_DELEGATORS_PATH = join(__dirname, "../data/tmp/delegators");
const STATUS_PATH = join(DELEGATORS_FOLDER, "status.json");
// Amounts below will be ignored
const MIN_REPRESENTATIVE_WEIGHT = 1000;
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

    // Skip, too many delegators (spam accounts?)
    if (
      account !==
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
      sleep(5000);
    }
  }

  fs.writeFileSync(
    `${ROOT_FOLDER}/delegators.json`,
    JSON.stringify(allDelegators, null, 2),
  );

  return;
};

const doDelegatorsCron = async () => {
  await mkdir(`${DELEGATORS_FOLDER}`, { recursive: true });
  await mkdir(`${TMP_DELEGATORS_PATH}`, { recursive: true });

  const startTime = new Date();
  console.log("Delegators cron started");
  try {
    const delegators = await getAccountDelegators();

    // fs.writeFileSync(DELEGATORS_PATH, JSON.stringify(delegators, null, 2));
    // fs.writeFileSync(
    //   STATUS_PATH,
    //   JSON.stringify(
    //     {
    //       executionTime: (new Date() - startTime) / 1000,
    //       date: new Date(),
    //     },
    //     null,
    //     2,
    //   ),
    // );

    // delegatorsCache.set(DELEGATORS, delegators);
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

// const reorderFiles = async () => {
//   console.log("Reordering Delegators");
//   const files = await readdir(DELEGATORS_FOLDER);

//   console.log("~~~files", files);

//   // const allDelegators = {};

//   for (let i = 0; i < files.length; i++) {
//     const delegators = JSON.parse(
//       fs.readFileSync(`${DELEGATORS_FOLDER}/${files[i]}`, "utf8"),
//     );

//     const sortedDelegators = Object.fromEntries(
//       Object.entries(delegators).sort((a, b) => b[1] - a[1]),
//     );

//     const trimmedDelegators = Object.fromEntries(
//       Object.entries(sortedDelegators).slice(0, 100),
//     );

//     try {
//       fs.writeFileSync(
//         `${DELEGATORS_FOLDER}/${files[i]}`,
//         JSON.stringify(trimmedDelegators, null, 2),
//       );
//     } catch (err) {
//       console.log("~~~~err", err);
//     }

//     sleep(250);
//   }

//   // fs.writeFileSync(
//   //   `${ROOT_FOLDER}/delegators.json`,
//   //   JSON.stringify(allDelegators, null, 2),
//   // );
// };

// reorderFiles();

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
