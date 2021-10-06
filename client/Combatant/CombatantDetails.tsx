import * as React from "react";

import { StatBlockComponent } from "../Components/StatBlock";
import { StatBlockHeader } from "../Components/StatBlockHeader";
import { TextEnricherContext } from "../TextEnricher/TextEnricher";
import { CombatantViewModel } from "./CombatantViewModel";
import { useSubscription } from "./linkComponentToObservables";
import { SettingsContext } from "../Settings/SettingsContext";
import { Tag } from "./Tag";
import { useContext } from "react";

interface CombatantDetailsProps {
  combatantViewModel: CombatantViewModel;
  displayMode: "default" | "active" | "status-only";
  key: string;
}

export function CombatantDetails(props: CombatantDetailsProps) {
  const TextEnricher = useContext(TextEnricherContext);
  const currentHp = useSubscription(props.combatantViewModel.HP);
  const currentHPPercentage = useSubscription(props.combatantViewModel.HPPercentage);
  const name = useSubscription(props.combatantViewModel.Name);
  const tags = useSubscription(props.combatantViewModel.Combatant.Tags);
  const notes = useSubscription(
    props.combatantViewModel.Combatant.CurrentNotes
  );
  const statBlock = useSubscription(
    props.combatantViewModel.Combatant.StatBlock
  );

  const { DisplayHPBar } = useContext(SettingsContext).TrackerView;
  if (!props.combatantViewModel) {
    return null;
  }

  const renderedNotes = notes.length
    ? TextEnricher.EnrichText(
        notes,
        props.combatantViewModel.Combatant.CurrentNotes
      )
    : null;

  return (
    <div className="c-combatant-details">
      <StatBlockHeader
        name={name}
        statBlockName={statBlock.Name}
        source={statBlock.Source}
        type={statBlock.Type}
        imageUrl={statBlock.ImageURL}
      />
      <div className="c-combatant-details__hp">
        <span className="stat-label">Current HP</span>
        <span>
          {currentHp}
          {DisplayHPBar && (
            <span className="combatant__hp-bar">
              <span className="combatant__hp-bar--filled" style={renderHPBarStyle(currentHPPercentage)}/>
            </span>
          )}
        </span>
      </div>
      {tags.length > 0 && (
        <div className="c-combatant-details__tags">
          <span className="stat-label">Tags</span>{" "}
          <span className="stat-value">
            {tags.map((tag, index) => (
              <React.Fragment key={index}>
                <TagDetails tag={tag} />
              </React.Fragment>
            ))}
          </span>
        </div>
      )}
      {props.displayMode !== "status-only" && (
        <StatBlockComponent
          statBlock={statBlock}
          displayMode={props.displayMode}
          hideName
        />
      )}
      {renderedNotes && (
        <div className="c-combatant-details__notes">{renderedNotes}</div>
      )}
    </div>
  );
}

function TagDetails(props: { tag: Tag }) {
  const notExpired = useSubscription(props.tag.NotExpired);
  const durationRemaining = useSubscription(props.tag.DurationRemaining);
  if (!notExpired) {
    return null;
  }
  if (props.tag.HasDuration) {
    return (
      <span className="stat-value__item">
        {props.tag.Text} ({durationRemaining} more rounds)
      </span>
    );
  }

  return <span className="stat-value__item">{props.tag.Text}</span>;
}
function renderHPBarStyle(currentHPPercentage) {
  return {width: currentHPPercentage };
}
