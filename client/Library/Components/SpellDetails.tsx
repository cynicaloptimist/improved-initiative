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
          <label>Casting Time:</label> {props.Spell.CastingTime}
        </div>
        <div>
          <label>Range:</label> {props.Spell.Range}
        </div>
        <div>
          <label>Components:</label> {props.Spell.Components}
        </div>
        <div>
          <label>Duration:</label> {props.Spell.Duration}
        </div>
        <div>
          <label>Classes:</label> {props.Spell.Classes.join(", ")}
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
