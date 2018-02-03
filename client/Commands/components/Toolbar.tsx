import * as React from "react";
import { Button } from "../../Components/Button";
import { Command } from "../Command";

interface ToolbarProps {
    encounterCommands: Command [];
    combatantCommands: Command [];
}

interface ToolbarState {
    displayWide: boolean;
}

export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    constructor(props: ToolbarProps) {
        super(props);
        this.state = {
            displayWide: false
        };
    }

    private toggleWidth = () => {
        this.setState({ displayWide: !this.state.displayWide });
    }

    public render() {
        const className = this.state.displayWide ? "toolbar s-wide" : "toolbar s-narrow";
        const commandToButton = c => <Button onClick={c.ActionBinding} additionalClassNames={c.ActionBarIcon} />;
        const encounterCommandButtons = this.props.encounterCommands.filter(c => c.ShowOnActionBar()).map(commandToButton);
        const combatantCommandButtons = this.props.combatantCommands.filter(c => c.ShowOnActionBar()).map(commandToButton);

        return <div className={className}>
            <div className="commands-encounter">
                {encounterCommandButtons}
            </div>
            <div className="commands-combatant">
                {combatantCommandButtons}
            </div>
        </div>;
    }
}