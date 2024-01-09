const BigNumber = require("bignumber.js");

const rawToRai = raw => {
  const value = new BigNumber(raw.toString());
  return value.shiftedBy(30 * -1).toNumber() || 0;
};

const raiToRaw = rai => {
  const value = new BigNumber(rai.toString());
  return value.shiftedBy(30).toNumber();
};

// 02LV are not present in addresses
const ACCOUNT_REGEX = /((nano|xrb)_)?[13][13-9a-km-uw-z]{59}/;

const isValidAccountAddress = address =>
  new RegExp(`^${ACCOUNT_REGEX.toString().replace(/\//g, "")}$`, "i").test(address);

const toBoolean = value =>
  typeof value === "string"
    ? value.toLowerCase() === "true" || !["", "0", "false"].includes(value.toLowerCase())
    : typeof value === "number"
    ? value !== 0
    : !!value;

module.exports = {
  rawToRai,
  raiToRaw,
  toBoolean,
  isValidAccountAddress,
};
