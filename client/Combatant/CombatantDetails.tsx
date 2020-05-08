import * as React from "react";

import { StatBlockComponent } from "../Components/StatBlock";
import { StatBlockHeader } from "../Components/StatBlockHeader";
import { TextEnricherContext } from "../TextEnricher/TextEnricher";
import { CombatantViewModel } from "./CombatantViewModel";
import { useSubscription } from "./linkComponentToObservables";
import { Tag } from "./Tag";
import { useContext } from "react";

interface CombatantDetailsProps {
  combatantViewModel: CombatantViewModel;
  displayMode: "default" | "active" | "status-only";
}

export function CombatantDetails(props: CombatantDetailsProps) {
  const TextEnricher = useContext(TextEnricherContext);
  const currentHp = useSubscription(props.combatantViewModel.HP);
  const name = useSubscription(props.combatantViewModel.Name);
  const tags = useSubscription(props.combatantViewModel.Combatant.Tags);
  const notes = useSubscription(
    props.combatantViewModel.Combatant.CurrentNotes
  );
  const statBlock = useSubscription(
    props.combatantViewModel.Combatant.StatBlock
  );

  if (!props.combatantViewModel) {
    return null;
  }

  const renderedNotes = notes.length ? TextEnricher.EnrichText(notes) : null;

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
        <span className="stat-label">Current HP</span> {currentHp}
      </div>
      {tags.length > 0 && (
        <div className="c-combatant-details__tags">
          <span className="stat-label">Tags</span>{" "}
          {tags.map((tag, index) => (
            <React.Fragment key={index}>
              <TagDetails tag={tag} />
              {index !== tags.length - 1 && "; "}
            </React.Fragment>
          ))}
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
      <>
        {props.tag.Text} ({durationRemaining} more rounds)
      </>
    );
  }

  return <>{props.tag.Text}</>;
}
