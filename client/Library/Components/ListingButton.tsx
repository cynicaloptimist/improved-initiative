import * as React from "react";

interface Props {
    text?: string;
    faClass?: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
    onMouseOver?: React.MouseEventHandler<HTMLSpanElement>;
    onMouseOut?: React.MouseEventHandler<HTMLSpanElement>;
}

export class ListingButton extends React.Component<Props> {
    public render() {
        const text = this.props.text || "";
        const className = this.props.faClass ? `fa fa-${this.props.faClass}` : "fa";
        return <span
            className={className}
            onClick={this.props.onClick}
            onMouseOver={this.props.onMouseOver}
            onMouseOut={this.props.onMouseOut}>
            {text}</span>;
    } 
}