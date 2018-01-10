import * as React from "react";

export interface ButtonProps {
    name: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
}

export class Button extends React.Component<ButtonProps> {
    public render() {
        return <span className="fa" onClick={this.props.onClick}>{this.props.name}</span>;
    } 
}