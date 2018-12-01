import * as React from "react";

import { StatBlockComponent } from "../Components/StatBlock";
import { StatBlockHeader } from "../Components/StatBlockHeader";
import { TextEnricher } from "../TextEnricher/TextEnricher";
import { CombatantViewModel } from "./CombatantViewModel";

interface CombatantDetailsProps {
    combatantViewModel: CombatantViewModel;
    enricher: TextEnricher;
    displayMode: "default" | "active";
}

interface CombatantDetailsState { }
export class CombatantDetails extends React.Component<CombatantDetailsProps, CombatantDetailsState> {
    public render() {
        const currentHp = this.props.combatantViewModel.HP();
        const tags = this.props.combatantViewModel.Combatant.Tags().map(tag => {
            if (tag.HasDuration) {
                return `${tag.Text} (${tag.DurationRemaining} more rounds)`;
            }

            return tag.Text;
        });
        const notes = "TODO";
        const statBlock = this.props.combatantViewModel.Combatant.StatBlock();

        return <div className="c-combatant-details">
            <StatBlockHeader Name={this.props.combatantViewModel.Name()} ImageUrl={statBlock.ImageURL} />
            <div className="c-combatant-details__hp">Current HP: {currentHp}</div>
            {tags.length > 0 && <div className="c-combatant-details__tags">Tags: {tags.join(", ")}</div>}
            {notes.length > 0 && <div className="c-combatant-details__notes">Notes: {notes}</div>}
            <StatBlockComponent statBlock={statBlock} displayMode={this.props.displayMode} enricher={this.props.enricher} hideName />
        </div>;
    }
}