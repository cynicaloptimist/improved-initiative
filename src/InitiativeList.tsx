import * as React from "react";
import { Combatant } from "./Combatant";

export class InitiativeList extends React.Component<{ data: Combatant[] }, {}> {
    private props: { data: Combatant[] };
    render() {
        var combatantRows = this.props.data.map((c: Combatant) => (
            <li key={c.Id}>
                <span>{c.Initiative}</span>
                <span>{c.Name}</span>
                <span>{c.Hp}</span>
            </li>
        ));

        return (
            <ul className="combatants">
                {combatantRows}
            </ul>
        );
    }
}