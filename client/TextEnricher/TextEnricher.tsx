import * as _ from "lodash";
import { isString } from "lodash";
import * as React from "react";
import { SpecialComponents } from "react-markdown/lib/ast-to-react";
import { NormalComponents } from "react-markdown/lib/complex-types";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import * as ReactReplace from "react-string-replace-recursively";

import { Spell } from "../../common/Spell";
import {
  concatenatedStringRegex,
  toModifierString
} from "../../common/Toolbox";
import { Listing } from "../Library/Listing";
import { Conditions } from "../Rules/Conditions";
import { Dice } from "../Rules/Dice";
import { IRules, DefaultRules } from "../Rules/Rules";
import { CounterOrBracketedText } from "./Counter";

interface ReplaceConfig {
  [name: string]: {
    pattern: RegExp;
    matcherFn: (rawText: string, processed: string, key: string) => JSX.Element;
    ignore?: string[];
  };
}

export class TextEnricher {
  constructor(
    private rollDice: (diceExpression: string) => void,
    private referenceSpellListing: (listing: Listing<Spell>) => void,
    private referenceCondition: (condition: string) => void,
    private getSpellListings: () => Listing<Spell>[],
    private getSpellsByNameRegex: () => RegExp,
    private rules: IRules
  ) {}

  private referenceSpell = (spellName: string) => {
    const name = spellName.toLocaleLowerCase();
    const listing = _.find(
      this.getSpellListings(),
      s => s.Meta().Name.toLocaleLowerCase() == name
    );
    if (listing) {
      this.referenceSpellListing(listing);
    }
  };

  public GetEnrichedModifierFromAbilityScore = (score: number) => {
    const modifier = this.rules.GetModifierFromScore(score);
    return this.EnrichModifier(modifier);
  };

  public EnrichModifier = (modifier: number) => {
    const modifierString = toModifierString(modifier);
    return (
      <span className="rollable" onClick={() => this.rollDice(modifierString)}>
        {modifierString}
      </span>
    );
  };

  public EnrichText = (
    text: string,
    updateTextSource?: (newText: string) => void
  ): JSX.Element => {
    const replacer = this.buildReactReplacer(updateTextSource);

    const components: Partial<Omit<NormalComponents, keyof SpecialComponents> &
      SpecialComponents> = {
      p: ({ children }) => {
        if (isString(children)) {
          return <p>{replacer(children)}</p>;
        }
        if (children.length == 1) {
          return <p>{replacer(children[0])}</p>;
        }
        return <p>{children}</p>;
      }
    };

    return (
      <ReactMarkdown children={text} components={components} rawSourcePos />
    );
  };

  private buildReactReplacer(updateTextSource?: (newText: string) => void) {
    const replaceConfig: ReplaceConfig = {
      diceExpression: {
        pattern: Dice.GlobalDicePattern,
        matcherFn: (rawText, processed, key) => (
          <span
            className="rollable"
            key={key}
            onClick={() => this.rollDice(rawText)}
          >
            {rawText}
          </span>
        )
      },
      spells: {
        pattern: this.getSpellsByNameRegex(),
        matcherFn: (rawText, processed, key) => (
          <span
            className="spell-reference"
            key={key}
            onClick={() => this.referenceSpell(rawText)}
          >
            {rawText}
          </span>
        )
      },
      conditions: {
        pattern: concatenatedStringRegex(_.keys(Conditions)),
        matcherFn: (rawText, processed, key) => (
          <span
            className="condition-reference"
            key={key}
            onClick={() => this.referenceCondition(rawText)}
          >
            {rawText}
          </span>
        )
      },
      counter: {
        pattern: /\[(\d+\/\d+)\]/g,
        matcherFn: (rawText, processed, key) => {
          console.log("counter", rawText, processed, key);

          return CounterOrBracketedText(rawText, key, updateTextSource);
        }
      }
    };

    return ReactReplace(replaceConfig);
  }
}

export const TextEnricherContext = React.createContext(
  new TextEnricher(
    () => {},
    () => {},
    () => {},
    () => [],
    () => new RegExp("$^"),
    new DefaultRules()
  )
);
