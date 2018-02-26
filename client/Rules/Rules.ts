import * as _ from "lodash";

export interface IRules {
    GetModifierFromScore: (attribute: number) => number;
    AbilityCheck: (mod: number) => number;
    EnemyHPTransparency: string;
}

export class RollResult {
    constructor(public Rolls: number[], public Modifier: number, public DieSize: number) {

    }

    get Total(): number { return this.Rolls.reduce((p, c) => c + p, 0) + this.Modifier; }

    get String(): string {
        let output = `[${this.Rolls}]`;
        if (this.Modifier > 0) {
            output += ` + ${this.Modifier}`;
        }
        if (this.Modifier < 0) {
            output += ` - ${-this.Modifier}`;
        }
        return output + ` = ${this.Total}`;
    }

    get FormattedString(): string {
        const formattedRolls = this.Rolls.map(r => {
            if (r == this.DieSize) {
                return `<span class='s-roll-max'>${r.toString()}</span>`;
            }
            if (r == 1) {
                return `<span class='s-roll-min'>${r.toString()}</span>`;
            }
            return `<span class='s-roll'>${r.toString()}</span>`;
        }).join(", ");

        let output = `[${formattedRolls}]`;
        if (this.Modifier > 0) {
            output += ` + ${this.Modifier}`;
        }
        if (this.Modifier < 0) {
            output += ` - ${-this.Modifier}`;
        }
        return output + ` = ${this.Total}`;
    }
}

export class Dice {
    public static readonly ValidDicePattern = /(\d+)d(\d+)[\s]*([+-][\s]*\d+)?|([+-][\s]*\d+)/;
    public static readonly GlobalDicePattern = /(\d+d\d+(?:[\s]*[+-][\s]*\d+)?|[+-][\s]*\d+)/g;
    public static readonly RollDiceExpression = (expression: string) => {
        //Taken from http://codereview.stackexchange.com/a/40996
        const match = Dice.ValidDicePattern.exec(expression);
        if (!match) {
            throw "Invalid dice notation: " + expression;
        }

        const isLooseModifier = typeof match[4] == "string";
        if (match[4]) {
            const modifier = parseInt(match[4].replace(/[\s]*/g, ""));
            const d20Roll = Math.ceil(Math.random() * 20);
            return new RollResult([d20Roll], modifier, 20);
        }

        const howMany = (typeof match[1] == "undefined") ? 1 : parseInt(match[1]);
        const dieSize = parseInt(match[2]);

        const rolls = [];
        for (let i = 0; i < howMany; i++) {
            rolls[i] = Math.ceil(Math.random() * dieSize);
        }
        const modifier = (typeof match[3] == "undefined") ? 0 : parseInt(match[3].replace(/[\s]*/g, ""));
        return new RollResult(rolls, modifier, dieSize);
    }
}

export class DefaultRules implements IRules {
    public GetModifierFromScore = (abilityScore: number) => {
        return Math.floor((abilityScore - 10) / 2);
    }
    public AbilityCheck = (mod = 0, advantageType?: "advantage" | "disadvantage") => {
        if (advantageType == "advantage") {
            return _.max([Math.ceil(Math.random() * 20) + mod, Math.ceil(Math.random() * 20) + mod]);
        }
        if (advantageType == "disadvantage") {
            return _.min([Math.ceil(Math.random() * 20) + mod, Math.ceil(Math.random() * 20) + mod]);
        }
        return Math.ceil(Math.random() * 20) + mod;
    }
    public EnemyHPTransparency = "whenBloodied";
}
