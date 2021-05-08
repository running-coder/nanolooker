const BigNumber = require("bignumber.js");

const rawToRai = raw => {
  const value = new BigNumber(raw.toString());
  return value.shiftedBy(29 * -1).toNumber();
};

exports.rawToRai = rawToRai;
