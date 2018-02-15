import * as React from "react";

interface OverlayProps {
    maxHeightPx?: number;
    handleMouseEvents?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface OverlayState { }

export class Overlay extends React.Component<OverlayProps, OverlayState> {
    constructor(props) {
        super(props);
    }
    public render() {
        const style = { maxHeight: this.props.maxHeightPx || "100%" };

        return <div
            className="c-overlay"
            style={style}
            onMouseEnter={this.props.handleMouseEvents}
            onMouseLeave={this.props.handleMouseEvents}>
            {this.props.children}
        </div>;
    }
}
