import * as React from "react";

export interface ButtonProps {
    text?: string;
    faClass?: string;
    additionalClassNames?: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
    onMouseOver?: React.MouseEventHandler<HTMLSpanElement>;
}

export class Button extends React.Component<ButtonProps> {
    public render() {
        const text = this.props.text || "";
        const classNames = ["c-button", "fa"];
        if (this.props.faClass) {
            classNames.push(`fa-${this.props.faClass}`);
        }
        if (this.props.additionalClassNames) {
            classNames.push(this.props.additionalClassNames);
        }
        return <span className={classNames.join(" ")} onClick={this.props.onClick} onMouseOver={this.props.onMouseOver}>{text}</span>;
    }
}