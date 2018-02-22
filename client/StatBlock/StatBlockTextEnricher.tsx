import * as React from "react";
import * as ReactReplace from "react-string-replace-recursively";
import { SpellLibrary } from "../Library/SpellLibrary";
import { Dice, IRules } from "../Rules/Rules";

interface ReplaceConfig {
    [name: string]: {
        pattern: RegExp;
        matcherFn: (rawText: string, processed: string, key: string) => JSX.Element;
        ignore?: string[];
    };
}

type ReactReplace = (config: ReplaceConfig) => (input: string) => JSX.Element[];

export class StatBlockTextEnricher {
    constructor(
        private rollDice: (diceExpression: string) => void,
        private spellLibrary: SpellLibrary,
        private rules: IRules
    ) { }

    public EnrichText = (text: string, name = "") => {
        const replaceConfig: ReplaceConfig = {
            "diceExpression": {
                pattern: Dice.GlobalDicePattern,
                matcherFn: function (rawText, processed, key) {
                    return <span className="rollable" key={key} onClick={() => this.rollDice(processed)}>{processed}</span>;
                },
            }
        };

        const replacer = ReactReplace(replaceConfig);

        return replacer(text);
    }
}
