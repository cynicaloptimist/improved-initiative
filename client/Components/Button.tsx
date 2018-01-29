import * as React from "react";

export interface ButtonProps {
    text?: string;
    faClass?: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
    onMouseOver?: React.MouseEventHandler<HTMLSpanElement>;
}

export class Button extends React.Component<ButtonProps> {
    public render() {
        const text = this.props.text || "";
        const className = this.props.faClass ? `c-button fa fa-${this.props.faClass}` : "c-button fa";
        return <span className={className} onClick={this.props.onClick} onMouseOver={this.props.onMouseOver}>{text}</span>;
    } 
}