import * as React from "react";
import { DefaultRules } from "../Rules/Rules";
import { StatBlock } from "../StatBlock/StatBlock";
import { StatBlockTextEnricher } from "../StatBlock/StatBlockTextEnricher";

interface StatBlockProps {
    statBlock: StatBlock;
    enricher: StatBlockTextEnricher;
}

interface StatBlockState { }

export class StatBlockComponent extends React.Component<StatBlockProps, StatBlockState> {
    private signModifier = (modifier: number) => (modifier >= 0 ? "+" : "") + modifier;

    public render() {
        const statBlock = this.props.statBlock;
        const rules = new DefaultRules();
        const enricher = this.props.enricher;

        const modifierTypes = [
            { name: "Saves", data: statBlock.Saves },
            { name: "Skills", data: statBlock.Skills },
        ];

        const keywordSetTypes = [
            { name: "Senses", data: statBlock.Senses },
            { name: "Damage Vulnerabilities", data: statBlock.DamageVulnerabilities },
            { name: "Damage Resistances", data: statBlock.DamageResistances },
            { name: "Damage Immunities", data: statBlock.DamageImmunities },
            { name: "Condition Immunities", data: statBlock.ConditionImmunities },
            { name: "Languages", data: statBlock.Languages },
        ];

        const powerTypes = [
            { name: "Traits", data: statBlock.Traits },
            { name: "Actions", data: statBlock.Actions },
            { name: "Reactions", data: statBlock.Reactions },
            { name: "Legendary Actions", data: statBlock.LegendaryActions },
        ];

        return <div className="c-statblock">
            <h3 className="Name">{statBlock.Name}</h3>
            <div className="Source">{statBlock.Source}</div>
            <div className="Type">{statBlock.Type}</div>

            <hr />

            <div className="AC">
                <span className="stat-label">Armor Class</span>
                <span>{statBlock.AC.Value}</span>
                <span className="notes">{enricher.EnrichText(statBlock.AC.Notes)}</span>
            </div>

            <div className="HP">
                <span className="stat-label">Hit Points</span>
                <span>{statBlock.HP.Value}</span>
                <span className="notes">{enricher.EnrichText(statBlock.HP.Notes)}</span>
            </div>

            <div className="speed">
                <span className="stat-label">Speed</span>
                <span>{statBlock.Speed.join(", ")}</span>
            </div>

            <div className="Abilities">
                {Object.keys(statBlock.Abilities).map(abilityName => {
                    const abilityScore = statBlock.Abilities[abilityName];
                    const abilityModifier = this.signModifier(rules.GetModifierFromScore(abilityScore));
                    return <div key={abilityName}>
                        <div className="stat-label">{abilityName}</div>
                        <div className={"score " + abilityName}>{abilityScore}</div>
                        <div className={"modifier " + abilityName}>{abilityModifier}</div>
                    </div>;
                })}
            </div>

            <div className="modifiers">
                {modifierTypes
                    .filter(modifierType => modifierType.data.length > 0)
                    .map(modifierType =>
                        <div key={modifierType.name} className={modifierType.name}>
                            <span className="stat-label">{modifierType.name}</span>
                            {modifierType.data.map(modifier =>
                                <span key={modifier.Name}>{modifier.Name}{this.signModifier(modifier.Modifier)} </span>
                            )}
                        </div>
                    )}
            </div>

            <div className="keyword-sets">
                {keywordSetTypes
                    .filter(keywordSetType => keywordSetType.data.length > 0)
                    .map(keywordSetType =>
                        <div key={keywordSetType.name} className={keywordSetType.name}>
                            <span className="stat-label">{keywordSetType.name}</span>
                            {keywordSetType.data.join(", ")}
                        </div>
                    )}
            </div>

            {statBlock.Challenge &&
                <div className="Challenge">
                    <span className="stat-label">
                        {statBlock.Player == "player" ?
                            "Level" : "Challenge"}</span>
                    <span>{statBlock.Challenge}</span>
                </div>
            }

            <hr />

            {powerTypes
                .filter(powerType => powerType.data.length > 0)
                .map(powerType =>
                    <div key={powerType.name} className={powerType.name}>
                        <h4 className="stat-label">{powerType.name}</h4>
                        {powerType.data.map(power =>
                            <div key={power.Name}>
                                <span className="stat-label">{power.Name}</span>
                                {power.Usage && <span className="stat-label">{power.Usage}</span>}
                                <span className="power-content">{enricher.EnrichText(power.Content)}</span>
                            </div>
                        )}
                    </div>
                )}

            {statBlock.Description && <div className="Description">{enricher.EnrichText(statBlock.Description)}</div>}
        </div>;
    }
}
