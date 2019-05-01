import * as React from "react";
import { Spell } from "../../../common/Spell";
import { TextEnricher } from "../../TextEnricher/TextEnricher";

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

export function SpellDetails(props: {
  Spell: Spell;
  TextEnricher: TextEnricher;
}) {
  return (
    <div className="spell">
      <h3>{props.Spell.Name}</h3>
      <p className="spell-type">{getSpellType(props.Spell)}</p>
      <div className="spell-details">
        <p>
          <label>Casting Time:</label> {props.Spell.CastingTime}
        </p>
        <p>
          <label>Range:</label> {props.Spell.Range}
        </p>
        <p>
          <label>Components:</label> {props.Spell.Components}
        </p>
        <p>
          <label>Duration:</label> {props.Spell.Duration}
        </p>
        <p>
          <label>Classes:</label> {props.Spell.Classes.join(", ")}
        </p>
      </div>
      <p className="spell-description">
        {props.TextEnricher.EnrichText(props.Spell.Description)}
      </p>
      <p className="spell-source">Source: {props.Spell.Source}</p>
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
