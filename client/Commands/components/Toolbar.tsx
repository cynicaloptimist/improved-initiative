import * as React from "react";
import { Button } from "../../Components/Button";
import { Command } from "../Command";

interface ToolbarProps {
    encounterCommands: Command[];
    combatantCommands: Command[];
}

interface ToolbarState {
    displayWide: boolean;
    widthStyle: string;
}

export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    private innerElement: HTMLDivElement;
    private outerElement: HTMLDivElement;
    
    constructor(props: ToolbarProps) {
        super(props);
        this.state = {
            displayWide: false,
            widthStyle: null
        };
    }

    public componentDidMount() {
        const width = this.outerElement.offsetWidth + this.innerElement.offsetWidth - this.innerElement.clientWidth;
        this.setState({widthStyle: width.toString() + "px"});
    }

    private toggleWidth = () => {
        this.setState({ displayWide: !this.state.displayWide });
    }

    public render() {
        const className = this.state.displayWide ? "toolbar s-wide" : "toolbar s-narrow";
        const commandToButton = c => <Button onClick={c.ActionBinding} additionalClassNames={c.ActionBarIcon} />;
        const encounterCommandButtons = this.props.encounterCommands.filter(c => c.ShowOnActionBar()).map(commandToButton);
        const combatantCommandButtons = this.props.combatantCommands.filter(c => c.ShowOnActionBar()).map(commandToButton);

        //TODO: Ensure subscription to ShowOnActionBar changes

        return <div className={className} ref={e => this.outerElement = e}>
            <div className="scrollframe" ref={e => this.innerElement = e} style={{ width: this.state.widthStyle }}>
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