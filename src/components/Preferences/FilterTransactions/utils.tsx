interface Unit {
  unit?: string;
  raw: number;
  display?: string;
}

export const units: Unit[] = [
  {
    raw: Infinity,
  },
  {
    unit: "Ӿ1000",
    raw: 1e33,
    display: "1000 Ban",
  },
  {
    unit: "Ӿ1",
    raw: 1e30,
    display: "1 Ban",
  },
  {
    unit: "Ӿ0.001",
    raw: 1e27,
    display: `0.001 Ban`,
  },
  {
    unit: "Ӿ0.000001",
    raw: 1e24,
    display: `0.000001 Ban`,
  },
  {
    unit: "1e+21 raw",
    raw: 1e21,
    display: "1e+21 raw",
  },
  {
    unit: "1e+18 raw",
    raw: 1e18,
    display: "1e+18 raw",
  },
  {
    unit: "raw",
    raw: 1,
    display: "1 raw",
  },
];

export const DEFAULT_UNITS: [number, number] = [units[0].raw, units[2].raw];
