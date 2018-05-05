import * as _ from "lodash";
import * as Markdown from "markdown-it";
import * as React from "react";
import * as ReactReplace from "react-string-replace-recursively";
import { concatenatedStringRegex, toModifierString } from "../../common/Toolbox";
import { Listing } from "../Library/Listing";
import { SpellLibrary } from "../Library/SpellLibrary";
import { Conditions } from "../Rules/Conditions";
import { Dice, IRules } from "../Rules/Rules";
import { Spell } from "../Spell/Spell";

interface ReplaceConfig {
    [name: string]: {
        pattern: RegExp;
        matcherFn: (rawText: string, processed: string, key: string) => JSX.Element;
        ignore?: string[];
    };
}

type ReactReplacer = (input: string) => JSX.Element[];
type ReactReplace = (config: ReplaceConfig) => ReactReplacer;

export class StatBlockTextEnricher {
    constructor(
        private rollDice: (diceExpression: string) => void,
        private referenceSpellListing: (listing: Listing<Spell>) => void,
        private spellLibrary: SpellLibrary,
        private rules: IRules
    ) { }

    private referenceSpell = (spellName: string) => {
        const name = spellName.toLocaleLowerCase();
        const listing = _.find(this.spellLibrary.Spells(), s => s.CurrentName().toLocaleLowerCase() == name);
        if (listing) {
            this.referenceSpellListing(listing);
        }
    }

    private referenceCondition = (condition: string) => {
        //TODO: Let's migrate the whole prompt queue to react before adding a ConditionReferencePrompt component
    }

    public GetEnrichedModifierFromAbilityScore = (score: number) => {
        const modifier = this.rules.GetModifierFromScore(score);
        return this.EnrichModifier(modifier);
    }

    public EnrichModifier = (modifier: number) => {
        const modifierString = toModifierString(modifier);
        return <span className="rollable" onClick={() => this.rollDice(modifierString)}>{modifierString}</span>;
    }

    public EnrichText = (text: string, name = "") => {
        const replaceConfig: ReplaceConfig = {
            "diceExpression": {
                pattern: Dice.GlobalDicePattern,
                matcherFn: (rawText, processed, key) => <span className="rollable" key={key} onClick={() => this.rollDice(rawText)}>{rawText}</span>,
            },
            "spells": {
                pattern: this.spellLibrary.SpellsByNameRegex(),
                matcherFn: (rawText, processed, key) => <span className="spell-reference" key={key} onClick={() => this.referenceSpell(rawText)}>{rawText}</span>
            },
            "conditions": {
                pattern: concatenatedStringRegex(_.keys(Conditions)),
                matcherFn: (rawText, processed, key) => <span className="spell-reference" key={key} onClick={() => this.referenceCondition(rawText)}>{rawText}</span>
            }
        };

        const replacer = ReactReplace(replaceConfig);

        const markdownText = Markdown().renderInline(text);

        return replacer(markdownText);
    }
}
