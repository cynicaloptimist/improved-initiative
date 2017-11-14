interface XpThresholds {
    easy: number;
    medium: number;
    hard: number;
    deadly: number;
}

const xpThresholdsByLevel: { [level: number]: XpThresholds } = {
    1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
    2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
    3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
    4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
    5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
    6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
    7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
    8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
    9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
    10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
    11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
    12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
    13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
    14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
    15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
    16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
    17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
    18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
    19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
    20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
}

const xpAmountsByChallenge = {
    "0": 0, "1/8": 25, "1/4": 50, "1/2": 100,
    "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
    "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
    "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
    "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
    "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000,
    "26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000
}

const getTotalLevel = (levels: string) =>
    levels
        .match(/\d+/g)
        .map(i => parseInt(i))
        .reduce((p, c) => p + c, 0);

const rankedXpMultipliers = [1, 1, 1.5, 2, 2.5, 3, 4, 4];

const getXpMultiplierRank = (enemyCount: number) => {
    if (enemyCount <= 1)
        return 1;
    if (enemyCount <= 2)
        return 2;
    if (enemyCount <= 6)
        return 3;
    if (enemyCount <= 10)
        return 4;
    if (enemyCount <= 14)
        return 5;

    return 6;
}

const getXpMultiplier = (enemyCount: number, playerCount: number) => {
    const multiplierRank = getXpMultiplierRank(enemyCount);

    if (playerCount === 0) {
        return rankedXpMultipliers[multiplierRank];
    }

    if (playerCount < 3) {
        return rankedXpMultipliers[multiplierRank + 1];
    }

    if (playerCount > 5) {
        return rankedXpMultipliers[multiplierRank - 1];
    }

    return rankedXpMultipliers[multiplierRank];
}

const getTotalXpBase = (challengeRatings: string[]) =>
    challengeRatings.reduce((currentSum, cr) => {
        if (xpAmountsByChallenge[cr]) {
            return currentSum + xpAmountsByChallenge[cr];
        }
        return currentSum;
    }, 0);

const getModifiedXp = (enemyChallengeRatings: string[], playerCount: number) => {
    const totalXpBase = getTotalXpBase(enemyChallengeRatings);
    if (playerCount > 0) {
        return totalXpBase * getXpMultiplier(enemyChallengeRatings.length, playerCount);
    }
    return totalXpBase;
}

const getDifficulty = (totalXp, playerLevels: number[]) => {
    if (playerLevels.length == 0)
        return "";
    if (playerLevels.some(level => typeof level !== "number" || level < 1 || level > 20)) {
        return "";
    }

    const xpThresholds = {
        easy: playerLevels.reduce((p, c) => p + xpThresholdsByLevel[c].easy, 0),
        medium: playerLevels.reduce((p, c) => p + xpThresholdsByLevel[c].medium, 0),
        hard: playerLevels.reduce((p, c) => p + xpThresholdsByLevel[c].hard, 0),
        deadly: playerLevels.reduce((p, c) => p + xpThresholdsByLevel[c].deadly, 0),
    }

    if (totalXp > xpThresholds.deadly)
        return "Deadly";
    if (totalXp > xpThresholds.hard)
        return "Hard";
    if (totalXp > xpThresholds.medium)
        return "Medium";
    if (totalXp > xpThresholds.easy)
        return "Easy";

    return "Trivial";
}


export interface EncounterDifficulty {
    Difficulty: string;
    EarnedExperience: number;
    EffectiveExperience: number;
}

export class DifficultyCalculator {
    static Calculate(enemyChallengeRatings: string[], playerLevels: string[]): EncounterDifficulty {
        const playerLevelTotals = playerLevels.map(getTotalLevel);
        const totalXpBase = getTotalXpBase(enemyChallengeRatings);
        const modifiedXp = getModifiedXp(enemyChallengeRatings, playerLevels.length);

        return {
            Difficulty: getDifficulty(modifiedXp, playerLevelTotals),
            EarnedExperience: totalXpBase,
            EffectiveExperience: modifiedXp
        }
    }
}
