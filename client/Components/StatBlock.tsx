import * as React from "react";
import { StatBlock } from "../../common/StatBlock";
import {
  TextEnricher,
  TextEnricherContext
} from "../TextEnricher/TextEnricher";
import { StatBlockHeader } from "./StatBlockHeader";
import { useContext } from "react";
import { LoadingIndicator } from "./LoadingIndicator";
import ErrorBoundary from "./ErrorBoundary";
import { SettingsContext } from "../Settings/SettingsContext";

interface StatBlockProps {
  statBlock: StatBlock;
  displayMode: "default" | "active";
  hideName?: boolean;
  hideTopRow?: boolean;
  isLoading?: boolean;
}

export function StatBlockComponent(props: StatBlockProps) {
  return (
    <ErrorBoundary
      renderError={error => (
        <div className="c-statblock">
          <div>
            <p>There was a problem with this StatBlock:</p>
            <pre className="c-statblock__error">{error.toString()}</pre>
            <p>Please open it in the StatBlock Editor to check your JSON</p>
          </div>
        </div>
      )}
    >
      <StatBlockComponentNoError {...props} />
    </ErrorBoundary>
  );
}

function StatBlockComponentNoError(props: StatBlockProps) {
  const textEnricher = useContext(TextEnricherContext);
  const settings = useContext(SettingsContext);

  const statBlock = props.statBlock;

  const modifierTypes = [{ name: "Saves", data: statBlock.Saves }];

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
    { name: "Bonus Actions", data: statBlock.BonusActions },
    { name: "Reactions", data: statBlock.Reactions },
    { name: "Legendary Actions", data: statBlock.LegendaryActions },
    { name: "Mythic Actions", data: statBlock.MythicActions }
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

      {!props.hideTopRow && <hr />}
    </>
  );

  const statEntries = (
    <>
      {!props.hideTopRow && (
        <div className="HP AC speed Challenge">
          <span className="stat-label">Defense</span>
          <span className="stat-value">{statBlock.AC.Value}</span>
          {statBlock.Speed.length > 0 && (
            <>
              <span className="stat-label Speed">Speed</span>
              <span className="stat-value">
                {statBlock.Speed.map((speed, i) => (
                  <span
                    className="stat-value__item"
                    key={"stat-value__speed-" + i}
                  >
                    {speed}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
      )}

      {StatBlock.IsPlayerCharacter(statBlock) && (
        <div className="Abilities">
          {StatBlock.VisibleAbilityNames.map(abilityName => {
            const abilityScore = statBlock.Abilities[abilityName];
            const abilityModifier =
              textEnricher.GetEnrichedModifierFromAbilityScore(abilityScore);
            return (
              <div className="Ability" key={abilityName}>
                <div className="stat-label">
                  {StatBlock.AbilityDisplayNames[abilityName] || abilityName}
                </div>
                <span className={"modifier " + abilityName}>
                  {abilityModifier}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {settings.StatBlock.CustomFields.length > 0 && (
        <div className="custom-fields">
          {settings.StatBlock.CustomFields.map(fieldSetting => {
            const field = statBlock.CustomFields?.find(
              f => f.Name === fieldSetting.name
            );
            return (
              <div className="custom-field" key={fieldSetting.name}>
                <span className="stat-label">{fieldSetting.name}</span>
                <span className="stat-value">
                  {field ? field.Content : fieldSetting.defaultValue}
                </span>
              </div>
            );
          })}
        </div>
      )}

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

      <hr />
    </>
  );

  const actionEntries = powerTypes
    .filter(powerType => powerType?.data?.length > 0)
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

  if (props.isLoading) {
    return (
      <div className="c-statblock">
        {headerEntries}
        <LoadingIndicator />
      </div>
    );
  }
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
