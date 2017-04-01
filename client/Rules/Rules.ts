module ImprovedInitiative {
    export interface IRules {
        GetModifierFromScore: (attribute: number) => number;
        Check: (...mods: number[]) => number;
        EnemyHPTransparency: string;
        RollDiceExpression: (expression: string) => RollResult;
        ValidDicePattern: RegExp;
    }

    export class RollResult {
        constructor(public Rolls: number[], public Modifier: number) {}
        get Total(): number { return this.Rolls.reduce((p, c) => c + p, 0) + this.Modifier; };
        get String(): string {
            var output = `[${this.Rolls}]`;
            if (this.Modifier > 0) {
                output += ` + ${this.Modifier}`
            }
            if (this.Modifier < 0) {
                output += ` - ${-this.Modifier}`
            }
            return output + ` = ${this.Total}`;
        }
    }    

    export class DefaultRules implements IRules {
        GetModifierFromScore = (abilityScore: number) => {
            return Math.floor((abilityScore - 10) / 2);
        }
        Check = (...mods: number[]) => {
            return Math.ceil(Math.random() * 20) + (mods.length ? mods.reduce((p, c) => p + c) : 0);
        }
        EnemyHPTransparency = "whenBloodied";
        ValidDicePattern = /(\d+)d(\d+)[\s]*([+-][\s]*\d+)?|([+-][\s]*\d+)/
        RollDiceExpression = (expression: string) => {
            //Taken from http://codereview.stackexchange.com/a/40996
            let match = this.ValidDicePattern.exec(expression);
            if (!match) {
                throw "Invalid dice notation: " + expression;
            }

            let isLooseModifier = typeof match[4] == 'string'
            if (match[4]) {
                let modifier = parseInt(match[4].replace(/[\s]*/g, ''));
                return new RollResult([this.Check()], modifier);
            }

            let howMany = (typeof match[1] == 'undefined') ? 1 : parseInt(match[1]);
            let dieSize = parseInt(match[2]);
            
            let rolls = [];
            for (let i = 0; i < howMany; i++) {
                rolls[i] = Math.ceil(Math.random() * dieSize);
            }
            let modifier = (typeof match[3] == 'undefined') ? 0 : parseInt(match[3].replace(/[\s]*/g, ''));
            return new RollResult(rolls, modifier);
        }
    }
}