import * as React from "react";
import * as ReactDOM from "react-dom";

interface OverlayProps {
    maxHeightPx?: number;
    handleMouseEvents?: (e: React.MouseEvent<HTMLDivElement>) => void;
    left?: number;
    top?: number;
}

interface OverlayState { 
    height: number;
}

export class Overlay extends React.Component<OverlayProps, OverlayState> {
    constructor(props: OverlayProps) {
        super(props);
        this.state = {
            height: null
        };
    }

    public render() {
        const overflowAmount = Math.max((this.props.top || 0) + this.state.height - window.innerHeight + 4, 0);
        const style: React.CSSProperties = {
            maxHeight: this.props.maxHeightPx || "100%",
            left: this.props.left || 0,
            top: (this.props.top - overflowAmount) || 0,
        };

        return <div
            className="c-overlay"
            style={style}
            onMouseEnter={this.props.handleMouseEvents}
            onMouseLeave={this.props.handleMouseEvents}>
            {this.props.children}
        </div>;
    }

    public componentDidMount() {
        this.updateHeight();
    }

    public componentDidUpdate() {
        this.updateHeight();
    }

    private updateHeight() {
        let domElement = ReactDOM.findDOMNode(this);
        if (domElement instanceof Element) {
            let newHeight = domElement.getBoundingClientRect().height;
            if (newHeight != this.state.height) {
                this.setState({ 
                    height: newHeight,
                });
            }
        }
    }
}
