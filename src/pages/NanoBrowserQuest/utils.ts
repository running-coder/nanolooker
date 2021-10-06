const expToLevelMap = [
  1,
  8,
  18,
  36,
  68,
  100,
  150,
  256,
  410,
  625, // 10

  915,
  1296,
  1785,
  2401,
  3164,
  4096,
  5220,
  6561,
  8145,
  10000, // 20

  12155,
  14641,
  17490,
  20736,
  24414,
  28561,
  33215,
  38416,
  44205,
  50625, // 30

  57720,
  65536,
  74120,
  83521,
  93789,
  104976,
  117135,
  130321,
  144590,
  160000, // 40
];

export const getLevel = (exp: number) => {
  let level = 1;

  for (let i = 0; i <= expToLevelMap.length; i++) {
    if (exp < expToLevelMap[i]) {
      break;
    }
    level += 1;
  }

  return level;
};
