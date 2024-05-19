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
import { BeanCounter, Counter } from "./Counter";

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

  public GetEnrichedModifierFromAbilityScore = (score: number): JSX.Element => {
    const modifier = this.rules.GetModifierFromScore(score);
    return this.EnrichModifier(modifier);
  };

  public EnrichModifier = (modifier: number): JSX.Element => {
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
    const replacer = this.buildReactReplacer(text, updateTextSource);

    const components: Partial<
      Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
    > = {
      p: ({ children }) => {
        return <p>{this.applyReplacer(replacer, children)}</p>;
      },
      li: ({ children }) => {
        return <li>{this.applyReplacer(replacer, children)}</li>;
      },
    };

    return (
      <ReactMarkdown children={text} components={components} rawSourcePos />
    );
  };

  private applyReplacer(
    replacer: any,
    children: React.ReactNode & React.ReactNode[]
  ) {
    if (isString(children)) {
      return replacer(children);
    }
    if (children.length == 1 && isString(children[0])) {
      return replacer(children[0]);
    }
    return children;
  }

  private buildReactReplacer(
    originalText: string,
    updateTextSource?: (newText: string) => void
  ) {
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
        pattern: /(.+\[\d+\/\d+\])/g,
        matcherFn: (rawText, processed, key) => {
          let bracketedCounterMatch: RegExp;
          try {
            bracketedCounterMatch = new RegExp(
              /(?<label>.*)\[(?<current>\d+)\/(?<maximum>\d+)\]/,
              "gd"
            );
          } catch (err) {
            console.warn("Dynamic counters are not supported on your browser:");
            console.warn(err);
            return;
          }

          const matches = bracketedCounterMatch.exec(rawText);
          if (
            updateTextSource === undefined ||
            !matches ||
            matches.length < 2
          ) {
            return <span key={key}>{rawText}</span>;
          }

          const label = matches.groups["label"] || "";
          const current = parseInt(matches.groups["current"]);
          const maximum = parseInt(matches.groups["maximum"]);

          if (maximum < 1) {
            return <span key={key}>{rawText}</span>;
          }

          const counterProps = {
            current,
            maximum,
            onChange: (newValue: number) => {
              const matchStart = originalText.indexOf(rawText);
              const currentRange = _.get(
                matches,
                "indices.groups.current",
                null
              );
              if (!currentRange) {
                console.warn("Counter not found in matches");
                console.table(matches);
                return;
              }
              const [currentStart, currentEnd] = currentRange;

              const updatedText =
                originalText.slice(0, matchStart + currentStart) +
                newValue +
                originalText.slice(matchStart + currentEnd);
              updateTextSource(updatedText);
            }
          };

          if (maximum <= 9) {
            return (
              <span key={key}>
                {label}
                <BeanCounter {...counterProps} />
              </span>
            );
          }

          return (
            <span key={key}>
              {label}
              <Counter {...counterProps} />
            </span>
          );
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
