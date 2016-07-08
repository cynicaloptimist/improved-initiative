module ImprovedInitiative {
    export interface IRules {
        Modifier: (attribute: number) => number;
        Check: (...mods: number[]) => number;
        GroupSimilarCreatures: boolean;
        EnemyHPTransparency: string;
        RollHpExpression: (expression: string) => RollResult;
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
                output += ` - ${this.Modifier}`
            }
            return output + ` = ${this.Total}`;
        }
    }    

    export class DefaultRules implements IRules {
        Modifier = (attribute: number) => {
            return Math.floor((attribute - 10) / 2);
        }
        Check = (...mods: number[]) => {
            return Math.ceil(Math.random() * 20) + mods.reduce((p, c) => p + c);
        }
        GroupSimilarCreatures = false;
        EnemyHPTransparency = "whenBloodied";
        ValidDicePattern = /(\d+)d(\d+)[\s]*([+-][\s]*\d+)?/
        RollHpExpression = (expression: string) => {
            //Taken from http://codereview.stackexchange.com/a/40996
            var match = this.ValidDicePattern.exec(expression);
            if (!match) {
                throw "Invalid dice notation: " + expression;
            }

            var howMany = (typeof match[1] == 'undefined') ? 1 : parseInt(match[1]);
            var dieSize = parseInt(match[2]);
            
            var rolls = [];
            for (var i = 0; i < howMany; i++) {
                rolls[i] = Math.ceil(Math.random() * dieSize);
            }
            var modifier = (typeof match[3] == 'undefined') ? 0 : parseInt(match[3].replace(' ', ''));
            return new RollResult(rolls, modifier);
        }
    }
}