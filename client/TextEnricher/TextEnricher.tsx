import * as _ from "lodash";
import * as React from "react";
import * as Markdown from "react-markdown";
import * as ReactReplace from "react-string-replace-recursively";

import { Spell } from "../../common/Spell";
import { StatBlock } from "../../common/StatBlock";
import {
  concatenatedStringRegex,
  toModifierString
} from "../../common/Toolbox";
import { Listing } from "../Library/Listing";
import { SpellLibrary } from "../Library/SpellLibrary";
import { Conditions } from "../Rules/Conditions";
import { Formula } from "../Rules/Formulas/Formula";
import { FormulaResult } from "../Rules/Formulas/FormulaTerm";
import { IRules } from "../Rules/Rules";

interface ReplaceConfig {
  [name: string]: {
    pattern: RegExp;
    matcherFn: (rawText: string, processed: string, key: string) => JSX.Element;
    ignore?: string[];
  };
}

export class TextEnricher {
  constructor(
    private displayRoll: (
      originalExpression: string,
      result: FormulaResult
    ) => void,
    private selectedStats: () => StatBlock | null,
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
    return this.EnrichModifier(toModifierString(modifier));
  };

  public EnrichModifier = (modifier: string, key?: string) => {
    if (Formula.WholeStringMatch.test(modifier)) {
      const formula = new Formula(modifier);
      const stats = this.selectedStats();
      if (stats === null && formula.RequiresStats) {
        return (
          <span
            key={key}
            className="rollable error requires-selected"
            title="This formula requires a selected combatant."
            dangerouslySetInnerHTML={{
              __html: formula.Annotated()
            }}
          />
        );
      } else {
        return (
          <span
            key={key}
            className="rollable"
            onClick={() => this.displayRoll(modifier, formula.RollCheck(stats))}
            dangerouslySetInnerHTML={{
              __html: formula.Annotated(stats)
            }}
          />
        );
      }
    } else {
      return (
        <span
          key={key}
          className="rollable error syntax-error"
          title="This formula has a syntax error."
        >
          {modifier}
        </span>
      );
    }
  };

  public EnrichText = (text: string, name = "") => {
    const replaceConfig: ReplaceConfig = {
      diceExpression: {
        pattern: new RegExp(Formula.DefaultPattern, "g"),
        matcherFn: (rawText, processed, key) => {
          return this.EnrichModifier(rawText, key);
        }
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
      text: props => replacer(props.children)
    };

    return <Markdown source={text} renderers={renderers} />;
  };
}
