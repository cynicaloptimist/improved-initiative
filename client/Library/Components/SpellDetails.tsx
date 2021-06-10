import * as React from "react";
import { Spell } from "../../../common/Spell";
import { TextEnricherContext } from "../../TextEnricher/TextEnricher";

const numberSuffixes = [
  "0th",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th"
];

export function SpellDetails(props: { Spell: Spell }) {
  const textEnricher = React.useContext(TextEnricherContext);
  return (
    <div className="spell">
      <h3>{props.Spell.Name}</h3>
      <div className="spell-type">{getSpellType(props.Spell)}</div>
      <div className="spell-details">
        <div>
          <label className="spell-label">Casting Time:</label>
          <span className="spell-value">{props.Spell.CastingTime}</span>
        </div>
        <div>
          <label className="spell-label">Range:</label>
          <span className="spell-value">{props.Spell.Range}</span>
        </div>
        <div>
          <label className="spell-label">Components:</label>
          <span className="spell-value">
            {props.Spell.Components.split(/\s*,\s*/).map((component, index) => {
              return (
                <span className="spell-value__item">{component}</span>
              )
            })}
          </span>
        </div>
        <div>
          <label className="spell-label">Duration:</label>
          <span className="spell-value">{props.Spell.Duration}</span>
        </div>
        <div>
          <label className="spell-label">Classes:</label>
          <span className="spell-value">
            {props.Spell.Classes.map((spellClass, index) => {
              return (
                <span className="spell-value__item">{spellClass}</span>
              )
            })}
          </span>
        </div>
      </div>
      <div className="spell-description">
        {textEnricher.EnrichText(props.Spell.Description)}
      </div>
      <div className="spell-source">Source: {props.Spell.Source}</div>
    </div>
  );
}

function getSpellType(spell: Spell) {
  const ritual = spell.Ritual ? " (ritual)" : "";
  if (spell.Level === 0) {
    return `${spell.School} cantrip${ritual}`;
  }
  const numberSuffix = numberSuffixes[spell.School];
  if (numberSuffix) {
    return `${numberSuffix}-level ${spell.School}${ritual}`;
  }

  return `Level ${spell.Level} ${spell.School}${ritual}`;
}
