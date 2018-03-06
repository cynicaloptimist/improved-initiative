import * as React from "react";

interface Props {
    text?: string;
    faClass?: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLSpanElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLSpanElement>;
}

export class ListingButton extends React.Component<Props> {
    public render() {
        const text = this.props.text || "";
        const className = this.props.faClass ? `fa fa-${this.props.faClass}` : "fa";
        return <span
            className={className}
            onClick={this.props.onClick}
            onMouseEnter={this.props.onMouseEnter}
            onMouseLeave={this.props.onMouseLeave}>
            {text}</span>;
    } 
}