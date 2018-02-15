import * as React from "react";

interface OverlayProps {
    maxHeightPx?: number;
}

interface OverlayState { }

export class Overlay extends React.Component<OverlayProps, OverlayState> {
    constructor(props) {
        super(props);
    }
    public render() {
        const style = { maxHeight: this.props.maxHeightPx || "100%" };

        return <div className="c-overlay" style={style}>
            {this.props.children}
        </div>;
    }
}
