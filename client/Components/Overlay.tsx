import * as React from "react";

interface OverlayProps {
    maxHeightPx?: number;
    handleMouseEvents?: (e: React.MouseEvent<HTMLDivElement>) => void;
    left?: number;
    top?: number;
}

interface OverlayState { }

export class Overlay extends React.Component<OverlayProps, OverlayState> {
    public render() {
        const style: React.CSSProperties = {
            maxHeight: this.props.maxHeightPx || "100%",
            left: this.props.left || 0,
            top: this.props.top || 0,
        };

        return <div
            className="c-overlay"
            style={style}
            onMouseEnter={this.props.handleMouseEvents}
            onMouseLeave={this.props.handleMouseEvents}>
            {this.props.children}
        </div>;
    }
}
