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
        const classNames = ["c-button", "fa"];
        if(this.props.faClass){
            classNames.push(`fa-${this.props.faClass}`);
        }
        return <span className={classNames.join(" ")} onClick={this.props.onClick} onMouseOver={this.props.onMouseOver}>{text}</span>;
    } 
}