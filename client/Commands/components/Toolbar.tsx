import * as React from "react";
import { Button } from "../../Components/Button";

interface ToolbarProps {

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
        return <div className={className}>
            <Button faClass="menu" onClick={this.toggleWidth} />
        </div>;
    }
}