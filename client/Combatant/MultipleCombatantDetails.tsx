import * as React from "react";
import { TextEnricher } from "../TextEnricher/TextEnricher";
import { CombatantDetails } from "./CombatantDetails";
import { CombatantViewModel } from "./CombatantViewModel";

interface MultipleCombatantDetailsProps {
  combatants: CombatantViewModel[];
  enricher: TextEnricher;
}

export class MultipleCombatantDetails extends React.Component<
  MultipleCombatantDetailsProps
> {
  public render() {
    return (
      <div className="c-multiple-combatant-details">
        {this.props.combatants.map(c => (
          <CombatantDetails
            combatantViewModel={c}
            enricher={this.props.enricher}
            displayMode="status-only"
            key={c.Combatant.Id}
          />
        ))}
      </div>
    );
  }
}
