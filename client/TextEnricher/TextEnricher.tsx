import * as _ from "lodash";
import * as React from "react";
import * as Markdown from "react-markdown";
import * as ReactReplace from "react-string-replace-recursively";

import { Spell } from "../../common/Spell";
import {
  concatenatedStringRegex,
  toModifierString
} from "../../common/Toolbox";
import { Listing } from "../Library/Listing";
import { SpellLibrary } from "../Library/SpellLibrary";
import { Conditions } from "../Rules/Conditions";
import { Dice } from "../Rules/Dice";
import { IRules } from "../Rules/Rules";
import { Counter } from "./Counter";

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
    private spellLibrary: SpellLibrary,
    private rules: IRules
  ) {}

  private referenceSpell = (spellName: string) => {
    const name = spellName.toLocaleLowerCase();
    const listing = _.find(
      this.spellLibrary.GetSpells(),
      s => s.Listing().Name.toLocaleLowerCase() == name
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
    updateText?: (newText: string) => void
  ) => {
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
        pattern: this.spellLibrary.SpellsByNameRegex(),
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
      }
    };

    const replacer = ReactReplace(replaceConfig);

    const renderers = {
      text: props => replacer(props.children),
      //Intercept rendering of [lone bracketed text] to capture [5/5] counter syntax.
      linkReference: counterOrBracketedText(text, updateText)
    };

    return <Markdown source={text} renderers={renderers} rawSourcePos />;
  };
}

function counterOrBracketedText(
  text: string,
  updateText?: (newText: string) => void
) {
  return (props: { children: React.ReactChildren }) => {
    const element = props.children[0];
    if (!element) {
      return <>[]</>;
    }
    const innerText: string = element.props.value || "";
    const matches = innerText.match(/\d+/g);
    if (updateText === undefined || !matches || matches.length < 2) {
      return <>[{innerText}]</>;
    }

    return (
      <Counter
        current={matches[0]}
        maximum={matches[1]}
        onChange={newValue => {
          const location = element.props.sourcePosition.start.offset;
          const newText =
            text.substr(0, location) +
            newValue +
            text.substr(location + matches[0].length);
          updateText(newText);
        }}
      />
    );
  };
}
