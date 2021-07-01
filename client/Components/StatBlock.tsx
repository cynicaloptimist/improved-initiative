import * as React from "react";
import { StatBlock } from "../../common/StatBlock";
import {
  TextEnricher,
  TextEnricherContext
} from "../TextEnricher/TextEnricher";
import { StatBlockHeader } from "./StatBlockHeader";
import { useContext } from "react";

interface StatBlockProps {
  statBlock: StatBlock;
  displayMode: "default" | "active";
  hideName?: boolean;
}

export function StatBlockComponent(props: StatBlockProps) {
  const textEnricher = useContext(TextEnricherContext);
  const statBlock = props.statBlock;

  const modifierTypes = [
    { name: "Saves", data: statBlock.Saves },
    { name: "Skills", data: statBlock.Skills }
  ];

  const keywordSetTypes = [
    { name: "Senses", data: statBlock.Senses },
    { name: "Damage Vulnerabilities", data: statBlock.DamageVulnerabilities },
    { name: "Damage Resistances", data: statBlock.DamageResistances },
    { name: "Damage Immunities", data: statBlock.DamageImmunities },
    { name: "Condition Immunities", data: statBlock.ConditionImmunities },
    { name: "Languages", data: statBlock.Languages }
  ];

  const powerTypes = [
    { name: "Traits", data: statBlock.Traits },
    { name: "Actions", data: statBlock.Actions },
    { name: "Reactions", data: statBlock.Reactions },
    { name: "Legendary Actions", data: statBlock.LegendaryActions }
  ];

  const headerEntries = (
    <>
      {props.hideName || (
        <StatBlockHeader
          name={statBlock.Name}
          imageUrl={statBlock.ImageURL}
          source={statBlock.Source}
          type={statBlock.Type}
        />
      )}

      <hr />
    </>
  );

  const statEntries = (
    <>
      <div className="AC">
        <span className="stat-label">Armor Class</span>
        <span className="stat-value">{statBlock.AC.Value}</span>
        <span className="notes">
          {textEnricher.EnrichText(statBlock.AC.Notes)}
        </span>
      </div>

      <div className="HP">
        <span className="stat-label">Hit Points</span>
        <span className="stat-value">{statBlock.HP.Value}</span>
        <span className="notes">
          {textEnricher.EnrichText(statBlock.HP.Notes)}
        </span>
      </div>

      <div className="speed">
        <span className="stat-label">Speed</span>
        <span className="stat-value">
          {statBlock.Speed.map((speed, i) => (
            <span className="stat-value__item" key={"stat-value__speed-" + i}>
              {speed}
            </span>
          ))}
        </span>
      </div>

      <div className="Abilities">
        {Object.keys(StatBlock.Default().Abilities).map(abilityName => {
          const abilityScore = statBlock.Abilities[abilityName];
          const abilityModifier = textEnricher.GetEnrichedModifierFromAbilityScore(
            abilityScore
          );
          return (
            <div className="Ability" key={abilityName}>
              <div className="stat-label">{abilityName}</div>
              <span className={"score " + abilityName}>{abilityScore}</span>
              <span className={"modifier " + abilityName}>
                {abilityModifier}
              </span>
            </div>
          );
        })}
      </div>

      <hr />

      <div className="modifiers">
        {modifierTypes
          .filter(modifierType => modifierType.data.length > 0)
          .map(modifierType => (
            <div key={modifierType.name} className={modifierType.name}>
              <span className="stat-label">{modifierType.name}</span>
              {modifierType.data.map((modifier, i) => (
                <span className="stat-value" key={i + modifier.Name}>
                  {modifier.Name}
                  {textEnricher.EnrichModifier(modifier.Modifier)}{" "}
                </span>
              ))}
            </div>
          ))}
      </div>

      <div className="keyword-sets">
        {keywordSetTypes
          .filter(keywordSetType => keywordSetType.data.length > 0)
          .map(keywordSetType => (
            <div key={keywordSetType.name} className={keywordSetType.name}>
              <span className="stat-label">{keywordSetType.name}</span>
              <span className="stat-value">
                <span className="stat-value__item">
                  {keywordSetType.data.map((keyword, index) => {
                    return (
                      <span
                        className="stat-value__item"
                        key={`stat-value__${keywordSetType.name}-${index}`}
                      >
                        {keyword}
                      </span>
                    );
                  })}
                </span>
              </span>
            </div>
          ))}
      </div>

      {statBlock.Challenge && (
        <div className="Challenge">
          <span className="stat-label">
            {statBlock.Player == "player" ? "Level" : "Challenge"}
          </span>
          <span className="stat-value">{statBlock.Challenge}</span>
        </div>
      )}

      <hr />
    </>
  );

  const actionEntries = powerTypes
    .filter(powerType => powerType.data.length > 0)
    .map(powerType => (
      <div key={powerType.name} className={powerType.name}>
        <h4 className="stat-label">{powerType.name}</h4>
        {powerType.data.map((power, j) => (
          <div key={j + power.Name}>
            {power.Name?.length ? (
              <span className="stat-label">{power.Name}</span>
            ) : null}
            {power.Usage && <span className="stat-label">{power.Usage}</span>}
            <span className="power-content">
              {textEnricher.EnrichText(power.Content)}
            </span>
          </div>
        ))}
        <hr />
      </div>
    ));

  const description = statBlock.Description && (
    <div className="Description">
      {textEnricher.EnrichText(statBlock.Description)}
    </div>
  );

  let innerEntries;
  if (props.displayMode == "active") {
    innerEntries = (
      <>
        {actionEntries}
        {statEntries}
      </>
    );
  } else {
    innerEntries = (
      <>
        {statEntries}
        {actionEntries}
      </>
    );
  }
  return (
    <div className="c-statblock">
      {headerEntries}
      {innerEntries}
      {description}
    </div>
  );
}
