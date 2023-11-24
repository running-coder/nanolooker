interface ItemAttributes {
  name: string;
  level: number;
  isUnique: boolean;
  itemClass: "low" | "medium" | "high" | "legendary";
  defense: number;
  damage: number;
  healthBonus: number;
  magicDamage: number;
  flameDamage: number;
  lightningDamage: number;
  pierceDamage: number;
  bonus: number[];
  partyBonus: any[];
  skill: any;
  requirement: number;
  description: any;
}

const bonusDescriptionMap = [
  "+# Minimum damage", // 0
  "+# Maximum damage", // 1
  "+# Attack", // 2
  "+# Health", // 3
  "+# Magic damage", // 4
  "+# Defense", // 5
  "+# Absorbed damage", // 6
  "+#% Experience", // 7
  "+# health regeneration per second", // 8
  "+#% Critical hit", // 9
  "+#% Block enemy attack", // 10
  "+#% Magic find", // 11
  "+#% Attack speed", // 12
  "+# Drain life", // 13
  "+# Flame damage", //14
  "+# Lightning damage", // 15
  "+# Pierce armor attack", // 16
  "+# Health", // 17
  "+# Cold damage", // 18
  "+#% Freeze the enemy for # seconds", // 19
  "-#% Chance of being frozen", // 20
  "+#% Magic resistance", // 21
  "+#% Flame resistance", // 22
  "+#% Lightning resistance", // 23
  "+#% Cold resistance", // 24
  "+#% Poison resistance", // 25
  "+#% Spectral resistance", // 26
  "+#% Magic damage", // 27
  "+#% Flame damage", // 28
  "+#% Lightning damage", // 29
  "+#% Cold damage", // 30
  "+#% Poison damage", // 31
  "+#% All resistances", // 32
  "+#% Prevent enemy health regeneration", // 33
  "+# Poison damage", // 34
  "#% Faster cast rate", // 35
  "-#% Enemy lower Magic resistance", // 36
  "-#% Enemy lower Flame resistance", // 37
  "-#% Enemy lower Lightning resistance", // 38
  "-#% Enemy lower Cold resistance", // 39
  "-#% Enemy lower Poison resistance", // 40
  "-#% Enemy lower resistances", // 41
  "+#% Extra gold from enemies", // 42
];

const bonusType = [
  "minDamage", // 0
  "maxDamage", // 1
  "attackDamage", // 2
  "health", // 3
  "magicDamage", // 4
  "defense", // 5
  "absorbedDamage", // 6
  "exp", // 7
  "regenerateHealth", // 8
  "criticalHit", // 9
  "blockChance", // 10
  "magicFind", // 11
  "attackSpeed", // 12
  "drainLife", // 13
  "flameDamage", // 14
  "lightningDamage", // 15
  "pierceDamage", // 16
  "highHealth", // 17
  "coldDamage", // 18
  "freezeChance", // 19
  "reduceFrozenChance", // 20
  "magicResistance", // 21
  "flameResistance", // 22
  "lightningResistance", // 23
  "coldResistance", // 24
  "poisonResistance", // 25
  "spectralResistance", // 26
  "magicDamagePercent", // 27
  "flameDamagePercent", // 28
  "lightningDamagePercent", // 29
  "coldDamagePercent", // 30
  "poisonDamagePercent", // 31
  "allResistance", // 32
  "preventRegenerateHealth", // 33
  "poisonDamage", // 34
  "skillTimeout", // 35
  "lowerMagicResistance", // 36
  "lowerFlameResistance", // 37
  "lowerLightningResistance", // 38
  "lowerColdResistance", // 39
  "lowerPoisonResistance", // 40
  "lowerAllResistance", // 41
  "extraGold", // 42
];

export const getItemAttributes = (props: ItemAttributes) => {
  const {
    name,
    level,
    isUnique,
    itemClass,
    defense,
    damage,
    healthBonus,
    magicDamage,
    flameDamage,
    lightningDamage,
    pierceDamage,
    bonus = [],
    skill: rawSkill,
    partyBonus: rawPartyBonus = [],
    requirement,
    description,
  } = props;

  let skill = null;
  if (typeof rawSkill === "number") {
    skill = getSkill(rawSkill, level);
  }

  let partyBonus = null;
  if (rawPartyBonus) {
    partyBonus = getPartyBonus(rawPartyBonus, 1);
  }

  // prettier-ignore
  return <div>
    <div className={`item-title${isUnique ? " unique" : ""}`}>{name}{level ? `(+${level})` : ""}</div>
    {itemClass ? <div className="item-class">({isUnique ? "Unique " : ""}{itemClass} class item)</div>: null}
    {defense ? <div className="item-description">Defense: {defense}</div> : null}
    {damage ? <div className="item-description">Attack: {damage}</div> : null}
    {magicDamage ? <div className="item-bonus">Magic damage: {magicDamage}</div>: null}
    {flameDamage ? <div className="item-bonus">Flame damage: {flameDamage}</div>: null}
    {lightningDamage ? <div className="item-bonus">Lightning damage: {lightningDamage}</div>: null}
    {pierceDamage ? <div className="item-bonus">Pierce damage: {pierceDamage}</div>: null}
    {healthBonus ? <div className="item-bonus">Health bonus: {healthBonus}</div>: null}
    {bonus ? getBonus(bonus, level).map(({ description }) => <div className="item-bonus">{description}</div>):null}
    {description ? <div className="item-description">{description}</div>: null}
    {skill ? <div className="item-skill">{skill.description}</div>: null}
    {partyBonus?.length ? <div className="item-set-description">Party Bonuses</div> : null}
    {partyBonus?.map(({ description }) => <div className="item-set-bonus">{description}</div>)}
    {requirement ? <div className="item-description">Required level: {requirement}</div>: null}
  </div>;
};

const getBonus = function (rawBonus: number[], level: number) {
  const minDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const maxDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const attackDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const healthPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];
  const magicDamagePerLevel = [1, 2, 3, 4, 6, 8, 12, 18, 26, 40];
  const defensePerLevel = [1, 2, 4, 6, 8, 11, 15, 22, 28, 40];
  const absorbPerLevel = [2, 4, 6, 8, 10, 13, 15, 18, 22, 28];
  const expPerLevel = [1, 2, 4, 6, 8, 10, 13, 17, 24, 30];
  const regenerateHealthPerLevel = [1, 2, 3, 6, 9, 12, 15, 20, 25, 40];
  const criticalHitPerLevel = [1, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const blockChancePerLevel = [1, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const magicFindPerLevel = [1, 2, 3, 5, 7, 9, 12, 16, 22, 30];
  const attackSpeedPerLevel = [1, 2, 3, 4, 6, 8, 10, 15, 20, 30];
  const drainLifePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const flameDamagePerLevel = [3, 6, 9, 12, 15, 20, 28, 35, 45, 60];
  const lightningDamagePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const pierceDamagePerLevel = [3, 6, 9, 12, 15, 20, 28, 35, 45, 60];
  const highHealthPerLevel = [10, 20, 30, 40, 50, 70, 100, 140, 200, 280];
  const coldDamagePerLevel = [1, 3, 5, 7, 10, 13, 16, 20, 26, 34];
  const freezeChancePerLevel = [1, 1, 2, 3, 4, 6, 8, 11, 15, 20];
  const reduceFrozenChancePerLevel = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const magicResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const flameResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const lightningResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const coldResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const poisonResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const spectralResistancePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const magicDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const flameDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const lightningDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const coldDamagePercentPerLevel = [1, 2, 3, 5, 7, 10, 15, 19, 26, 35];
  const poisonDamagePercentPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];
  const allResistancePerLevel = [1, 2, 3, 4, 5, 7, 10, 15, 20, 28];
  const preventRegenerateHealthPerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const poisonDamagePerLevel = [1, 3, 6, 9, 12, 16, 20, 25, 32, 45];
  const skillTimeoutPerLevel = [1, 2, 4, 6, 8, 10, 13, 17, 24, 30];
  const lowerMagicResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerFlameResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerLightningResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerColdResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerPoisonResistancePerLevel = [1, 2, 4, 6, 9, 13, 17, 22, 28, 36];
  const lowerAllResistancePerLevel = [1, 2, 3, 5, 7, 9, 12, 16, 22, 30];
  const extraGoldPerLevel = [1, 2, 4, 7, 12, 15, 18, 22, 30, 40];

  const bonusPerLevel = [
    minDamagePerLevel,
    maxDamagePerLevel,
    attackDamagePerLevel,
    healthPerLevel,
    magicDamagePerLevel,
    defensePerLevel,
    absorbPerLevel,
    expPerLevel,
    regenerateHealthPerLevel,
    criticalHitPerLevel,
    blockChancePerLevel,
    magicFindPerLevel,
    attackSpeedPerLevel,
    drainLifePerLevel,
    flameDamagePerLevel,
    lightningDamagePerLevel,
    pierceDamagePerLevel,
    highHealthPerLevel,
    coldDamagePerLevel,
    freezeChancePerLevel,
    reduceFrozenChancePerLevel,
    magicResistancePerLevel,
    flameResistancePerLevel,
    lightningResistancePerLevel,
    coldResistancePerLevel,
    poisonResistancePerLevel,
    spectralResistancePerLevel,
    magicDamagePercentPerLevel,
    flameDamagePercentPerLevel,
    lightningDamagePercentPerLevel,
    coldDamagePercentPerLevel,
    poisonDamagePercentPerLevel,
    allResistancePerLevel,
    preventRegenerateHealthPerLevel,
    poisonDamagePerLevel,
    skillTimeoutPerLevel,
    lowerMagicResistancePerLevel,
    lowerFlameResistancePerLevel,
    lowerLightningResistancePerLevel,
    lowerColdResistancePerLevel,
    lowerPoisonResistancePerLevel,
    lowerAllResistancePerLevel,
    extraGoldPerLevel,
  ];

  const bonus: { type: string; stats: number; description: string }[] = [];

  // A glitch in the inventory system allowed for scrolls to be added as rings
  if (!rawBonus || !Array.isArray(rawBonus)) return bonus;

  for (let i = 0; i < rawBonus.length; i++) {
    const type = bonusType[rawBonus[i]];
    const stats = bonusPerLevel[rawBonus[i]][level - 1];

    // @ts-ignore
    let description = bonusDescriptionMap[rawBonus[i]].replace("#", stats);

    if (type === "freezeChance") {
      description = description.replace(
        "#",
        // @ts-ignore
        getFrozenTimePerLevel(level) / 1000,
      );
    }

    bonus.push({
      type,
      stats,
      description,
    });
  }

  return bonus;
};

const getFrozenTimePerLevel = (itemLevel: number) => 1000 + itemLevel * 150;

const skillDurationMap = {
  0: () => 900,
  1: (itemLevel: number) => itemLevel * 500,
  2: (itemLevel: number) => itemLevel * 500,
};

const getSkillDescriptionMap = [
  "+#% Instant health regeneration",
  "+#% Defense for # seconds",
  "+#% All resistances for # seconds",
];

const skillType = [
  "regenerateHealthSkill", // 0
  "defenseSkill", // 1
  "resistancesSkill", // 2
];

const getSkill = function (rawSkill: number, level: number) {
  const regenerateHealthSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const defenseSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  const resistanceSkillPerLevel = [5, 10, 15, 20, 25, 30, 40, 50, 75, 90];

  const skillPerLevel = [
    regenerateHealthSkillPerLevel,
    defenseSkillPerLevel,
    resistanceSkillPerLevel,
  ];

  let skill: { type: string; stats: number; description: string } | null = null;

  const type = skillType[rawSkill];
  const stats = skillPerLevel[rawSkill][level - 1];

  //@ts-ignore
  let description = getSkillDescriptionMap[rawSkill].replace("#", stats);

  if (type === "defenseSkill" || type === "resistancesSkill") {
    description = description.replace(
      "#",
      //@ts-ignore
      skillDurationMap[rawSkill](level) / 1000,
    );
  }

  skill = { type, stats, description };

  return skill;
};

const getPartyBonusDescriptionMap = [
  "+#% Attack",
  "+#% Defense",
  "+#% Experience",
  "+# Minimum damage",
  "+# Maximum damage",
  "+# Health",
  "+# Magic damage",
  "+#% All resistances",
  "+#% Extra gold from enemies",
];

const partyBonusType = [
  "attackDamage",
  "defense",
  "exp",
  "minDamage",
  "maxDamage",
  "health",
  "magicDamage",
  "allResistance",
  "extraGold",
];

const getPartyBonus = function (rawBonus: number[], level: number) {
  const attackDamagePerLevel = [1, 2, 3, 4, 6, 8, 11, 15, 20, 30];
  const defensePerLevel = [1, 2, 3, 4, 6, 8, 11, 15, 20, 30];
  const expPerLevel = [1, 2, 3, 4, 6, 8, 11, 15, 20, 30];
  const minDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const maxDamagePerLevel = [1, 2, 3, 4, 5, 6, 8, 12, 18, 30];
  const healthPerLevel = [1, 3, 6, 9, 12, 15, 20, 28, 35, 45];
  const magicDamagePerLevel = [1, 2, 3, 4, 6, 8, 12, 18, 26, 40];
  const allResistancePerLevel = [1, 2, 3, 4, 6, 8, 11, 14, 19, 25, 32];
  const extraGoldPerLevel = [1, 2, 3, 4, 6, 8, 11, 14, 19, 25, 32];

  const bonusPerLevel = [
    attackDamagePerLevel,
    defensePerLevel,
    expPerLevel,
    minDamagePerLevel,
    maxDamagePerLevel,
    healthPerLevel,
    magicDamagePerLevel,
    allResistancePerLevel,
    extraGoldPerLevel,
  ];

  const bonus: { type: string; stats: number; description: string }[] = [];

  // A glitch in the inventory system allowed for scrolls to be added as rings
  if (!rawBonus || !Array.isArray(rawBonus)) return bonus;
  for (let i = 0; i < rawBonus.length; i++) {
    const type = partyBonusType[rawBonus[i]];
    const stats = bonusPerLevel[rawBonus[i]][level - 1];
    const description = getPartyBonusDescriptionMap[rawBonus[i]].replace(
      "#",
      // @ts-ignore
      stats,
    );

    bonus.push({
      type,
      stats,
      description,
    });
  }

  return bonus;
};

export const runeKind = {
  sat: {
    rank: 1,
    requirement: 1,
    attribute: {
      health: 10,
    },
  },
  al: {
    rank: 2,
    requirement: 2,
    attribute: {
      minDamage: 4,
    },
  },
  bul: {
    rank: 3,
    requirement: 3,
    attribute: {
      maxDamage: 4,
    },
  },
  nan: {
    rank: 4,
    requirement: 4,
    attribute: {
      magicDamage: 4,
    },
  },
  mir: {
    rank: 5,
    requirement: 6,
    attribute: {
      attackDamage: 4,
    },
  },
  gel: {
    rank: 6,
    requirement: 8,
    attribute: {
      absorbedDamage: 4,
    },
  },
  do: {
    rank: 7,
    requirement: 10,
    attribute: {
      defense: 4,
    },
  },
  ban: {
    rank: 8,
    requirement: 12,
    attribute: {
      exp: 4,
    },
  },
  vie: {
    rank: 9,
    requirement: 14,
    attribute: {
      regenerateHealth: 10,
    },
  },
  um: {
    rank: 10,
    requirement: 16,
    attribute: {
      flameDamage: 10,
    },
  },
  hex: {
    rank: 11,
    requirement: 18,
    attribute: {
      lightningDamage: 5,
    },
  },
  zal: {
    rank: 12,
    requirement: 20,
    attribute: {
      pierceDamage: 5,
    },
  },
  sol: {
    rank: 13,
    requirement: 22,
    attribute: {
      reduceFrozenChance: 5,
    },
  },
  eth: {
    rank: 14,
    requirement: 24,
    attribute: {
      poisonDamage: 10,
    },
  },
  btc: {
    rank: 15,
    requirement: 26,
    attribute: {
      magicResistance: 10,
    },
  },
  vax: {
    rank: 16,
    requirement: 28,
    attribute: {
      flameResistance: 10,
    },
  },
  por: {
    rank: 17,
    requirement: 30,
    attribute: {
      lightningResistance: 10,
    },
  },
  las: {
    rank: 18,
    requirement: 32,
    attribute: {
      coldResistance: 10,
    },
  },
  dur: {
    rank: 19,
    requirement: 34,
    attribute: {
      allResistance: 4,
    },
  },
  fal: {
    rank: 20,
    requirement: 36,
    attribute: {
      magicDamagePercent: 8,
    },
  },
  kul: {
    rank: 21,
    requirement: 38,
    attribute: {
      lightningDamagePercent: 8,
    },
  },
  mer: {
    rank: 22,
    requirement: 41,
    attribute: {
      flameDamagePercent: 8,
    },
  },
  qua: {
    rank: 23,
    requirement: 44,
    attribute: {
      coldDamagePercent: 8,
    },
  },
  gul: {
    rank: 24,
    requirement: 47,
    attribute: {
      poisonDamagePercent: 8,
    },
  },
  ber: {
    rank: 25,
    requirement: 50,
    attribute: {
      skillTimeout: 6,
    },
  },
  cham: {
    rank: 26,
    requirement: 53,
    attribute: {
      poisonResistance: 10,
    },
  },
  tor: {
    rank: 27,
    requirement: 56,
    attribute: {
      coldDamage: 10,
      freezeChance: 5,
    },
  },
  xno: {
    rank: 28,
    requirement: 59,
    attribute: {
      attackSpeed: 10,
    },
  },
  jah: {
    rank: 29,
    requirement: 62,
    attribute: {
      magicFind: 6,
    },
  },
  shi: {
    rank: 30,
    requirement: 65,
    attribute: {
      allResistance: 8,
    },
  },
  vod: {
    rank: 31,
    requirement: 68,
    attribute: {
      regenerateHealth: 10,
      preventRegenerateHealth: 10,
    },
  },
};

export const getItemClassFromBaseLevel = (level: number, baseLevel?: number) => {

  if (!baseLevel) {
    baseLevel =Number(level)
  }
  let itemClass;
  if (baseLevel < 5) {
    if (!level || level <= 5) {
      itemClass = "low";
    } else if (level <= 8) {
      itemClass = "medium";
    } else {
      itemClass = "high";
    }
  } else if (baseLevel < 10) {
    if (!level || level <= 5) {
      itemClass = "medium";
    } else {
      itemClass = "high";
    }
  } else if (baseLevel >= 10 && baseLevel < 48) {
    itemClass = "high";
    if (level >= 8) {
      itemClass = "legendary";
    }
  } else if (baseLevel >= 48) {
    itemClass = "legendary";
  }

  return itemClass;
};
