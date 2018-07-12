import * as React from "react";

interface Props {
    text?: string;
    buttonClass: string;
    faClass?: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLSpanElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLSpanElement>;
}

export class ListingButton extends React.Component<Props> {
    public render() {
        const text = this.props.text || "";
        
        const cssClasses = [`c-listing-button`, `c-listing-${this.props.buttonClass}`];
        if (this.props.faClass) {
            cssClasses.push("fa", `fa-${this.props.faClass}`);
        }
        
        return <span
            className={cssClasses.join(" ")}
            onClick={this.props.onClick}
            onMouseEnter={this.props.onMouseEnter}
            onMouseLeave={this.props.onMouseLeave}>
            {text}</span>;
    } 
}