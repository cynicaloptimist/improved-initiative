import * as React from "react";
import { SpellLibrary } from "../Library/SpellLibrary";
import { Dice, IRules } from "../Rules/Rules";

export class StatBlockTextEnricher {
    constructor(
        private rollDice: (diceExpression: string) => void,
        private spellLibrary: SpellLibrary,
        private rules: IRules
    ) { }

    public EnrichText = (text: string, name = "") => {
        const splitText = text.split(Dice.GlobalDicePattern);

        const withDiceEnriched = splitText.map((token, i) => {
            if (Dice.ValidDicePattern.test(token)) {
                return <span className="rollable" key={i} onClick={() => this.rollDice(token)}>{token}</span>;
            }
            return token;
        });

        return withDiceEnriched;
    }
}
