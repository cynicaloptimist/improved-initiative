import * as React from "react";
import { StatBlock } from "../../common/StatBlock";
import { TextEnricher } from "../TextEnricher/TextEnricher";
import { StatBlockHeader } from "./StatBlockHeader";

interface StatBlockProps {
  statBlock: StatBlock;
  enricher: TextEnricher;
  displayMode: "default" | "active";
  hideName?: boolean;
}

interface StatBlockState {}

export class StatBlockComponent extends React.Component<
  StatBlockProps,
  StatBlockState
> {
  public render() {
    const statBlock = this.props.statBlock;
    const enricher = this.props.enricher;

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
        {this.props.hideName || (
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
          <span>{statBlock.AC.Value}</span>
          <span className="notes">
            {enricher.EnrichText(statBlock.AC.Notes)}
          </span>
        </div>

        <div className="HP">
          <span className="stat-label">Hit Points</span>
          <span>{statBlock.HP.Value}</span>
          <span className="notes">
            {enricher.EnrichText(statBlock.HP.Notes)}
          </span>
        </div>

        <div className="speed">
          <span className="stat-label">Speed</span>
          <span>{statBlock.Speed.join(", ")}</span>
        </div>

        <div className="Abilities">
          {Object.keys(StatBlock.Default().Abilities).map(abilityName => {
            const abilityScore = statBlock.Abilities[abilityName];
            const abilityModifier = enricher.GetEnrichedModifierFromAbilityScore(
              abilityScore
            );
            return (
              <div key={abilityName}>
                <div className="stat-label">{abilityName}</div>
                <div className={"score " + abilityName}>{abilityScore}</div>
                <div className={"modifier " + abilityName}>
                  {abilityModifier}
                </div>
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
                  <span key={i + modifier.Name}>
                    {modifier.Name}
                    {enricher.EnrichModifier(modifier.Modifier)}{" "}
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
                {keywordSetType.data.join(", ")}
              </div>
            ))}
        </div>

        {statBlock.Challenge && (
          <div className="Challenge">
            <span className="stat-label">
              {statBlock.Player == "player" ? "Level" : "Challenge"}
            </span>
            <span>{statBlock.Challenge}</span>
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
                {enricher.EnrichText(power.Content)}
              </span>
            </div>
          ))}
          <hr />
        </div>
      ));

    const description = statBlock.Description && (
      <div className="Description">
        {enricher.EnrichText(statBlock.Description)}
      </div>
    );

    let innerEntries;
    if (this.props.displayMode == "active") {
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
}
