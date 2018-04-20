import * as React from "react";
import { Button } from "../../Components/Button";
import { Command } from "../Command";

interface ToolbarProps {
    encounterCommands: Command[];
    combatantCommands: Command[];
    displayMode: "narrow" | "wide";
}

interface ToolbarState {
    widthStyle: string;
}

export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    private innerElement: HTMLDivElement;
    private outerElement: HTMLDivElement;

    constructor(props: ToolbarProps) {
        super(props);
        this.state = {
            widthStyle: null
        };
    }

    public componentDidMount() {
        const width = this.outerElement.offsetWidth + this.innerElement.offsetWidth - this.innerElement.clientWidth;
        this.setState({ widthStyle: width.toString() + "px" });
    }

    public render() {
        const className = `c-toolbar s-${this.props.displayMode}`;
        const commandToButton =
            (c: Command) =>
                <Button
                    key={c.Description}
                    onClick={c.ActionBinding}
                    additionalClassNames={c.ActionBarIcon}
                    text={this.props.displayMode == "wide" ? c.Description : null}
                />;
        const encounterCommandButtons = this.props.encounterCommands.filter(c => c.ShowOnActionBar()).map(commandToButton);
        const combatantCommandButtons = this.props.combatantCommands.filter(c => c.ShowOnActionBar()).map(commandToButton);

        const style = this.props.displayMode == "narrow" ? { width: this.state.widthStyle } : null;

        return <div className={className} ref={e => this.outerElement = e}>
            <div className="scrollframe" ref={e => this.innerElement = e} style={style}>
                <div className="commands-encounter">
                    {encounterCommandButtons}
                </div>
                <div className="commands-combatant">
                    {combatantCommandButtons}
                </div>
            </div>
        </div>;
    }
}