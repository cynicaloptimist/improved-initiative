import * as React from "react";

interface ToolbarProps {

}

interface ToolbarState {
    displayWide: boolean;
}

export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    constructor(props: ToolbarProps){
        super(props);
        this.setState({
            displayWide: false
        });
    }

    public render() {
        const className = this.state.displayWide ? "toolbar s-wide" : "toolbar s-narrow";
        return <div className={className}>
        </div>;
    }
}