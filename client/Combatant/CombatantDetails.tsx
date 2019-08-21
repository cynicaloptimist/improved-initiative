import * as React from "react";

import { StatBlockComponent } from "../Components/StatBlock";
import { StatBlockHeader } from "../Components/StatBlockHeader";
import { TextEnricher } from "../TextEnricher/TextEnricher";
import { CombatantViewModel } from "./CombatantViewModel";
import { linkComponentToObservables } from "./linkComponentToObservables";

interface CombatantDetailsProps {
  combatantViewModel: CombatantViewModel;
  enricher: TextEnricher;
  displayMode: "default" | "active" | "status-only";
}

export class CombatantDetails extends React.Component<CombatantDetailsProps> {
  constructor(props) {
    super(props);
    linkComponentToObservables(this);
  }

  public render() {
    if (!this.props.combatantViewModel) {
      return null;
    }

    const currentHp = this.props.combatantViewModel.HP();
    const tags = this.props.combatantViewModel.Combatant.Tags()
      .filter(tag => tag.NotExpired())
      .map(tag => {
        if (tag.HasDuration) {
          return `${tag.Text} (${tag.DurationRemaining()} more rounds)`;
        }

        return tag.Text;
      });

    const notes = this.props.combatantViewModel.Combatant.CurrentNotes();
    const renderedNotes = notes ? this.props.enricher.EnrichText(notes) : null;

    const statBlock = this.props.combatantViewModel.Combatant.StatBlock();

    return (
      <div className="c-combatant-details">
        <StatBlockHeader
          name={this.props.combatantViewModel.Name()}
          source={statBlock.Source}
          type={statBlock.Type}
          imageUrl={statBlock.ImageURL}
        />
        <div className="c-combatant-details__hp">
          <span className="stat-label">Current HP</span> {currentHp}
        </div>
        {tags.length > 0 && (
          <div className="c-combatant-details__tags">
            <span className="stat-label">Tags</span> {tags.join("; ")}
          </div>
        )}
        {this.props.displayMode !== "status-only" && (
          <StatBlockComponent
            statBlock={statBlock}
            displayMode={this.props.displayMode}
            enricher={this.props.enricher}
            hideName
          />
        )}
        {notes && notes.length > 0 && (
          <div className="c-combatant-details__notes">{renderedNotes}</div>
        )}
      </div>
    );
  }
}
