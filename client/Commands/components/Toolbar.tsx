import * as React from "react";
import { Button } from "../../Components/Button";
import { Command } from "../Command";

interface ToolbarProps {
    encounterCommands: Command[];
    combatantCommands: Command[];
    width: "narrow" | "wide";
    showCombatantCommands: boolean;
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
        const className = `c-toolbar s-${this.props.width}`;
        const commandButtonTooltip =
            (c: Command) => {
                const keyBinding = c.KeyBinding ? `[${c.KeyBinding}] ` : "";
                return `${keyBinding}${c.Description}`;
            };
        const commandToButton =
            (c: Command) =>
                <Button
                    key={c.Description}
                    tooltip={commandButtonTooltip(c)}
                    onClick={c.ActionBinding}
                    fontAwesomeIcon={c.ActionBarIcon}
                    text={this.props.width == "wide" ? c.Description : null}
                />;
        const encounterCommandButtons = this.props.encounterCommands.map(commandToButton);
        const combatantCommandButtons = this.props.combatantCommands.map(commandToButton);

        const style = this.props.width == "narrow" ? { width: this.state.widthStyle } : null;

        return <div className={className} ref={e => this.outerElement = e}>
            <div className="scrollframe" ref={e => this.innerElement = e} style={style}>
                <div className="commands-encounter">
                    {encounterCommandButtons}
                </div>
                {this.props.showCombatantCommands &&
                    <div className="commands-combatant">
                        {combatantCommandButtons}
                    </div>
                }    
            </div>
        </div>;
    }
}