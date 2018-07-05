import * as React from "react";

export interface ButtonProps {
    text?: string;
    faClass?: string;
    tooltip?: string;
    additionalClassNames?: string;
    disabled?: boolean;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
    onMouseOver?: React.MouseEventHandler<HTMLSpanElement>;
}

export class Button extends React.Component<ButtonProps> {
    public render() {
        const text = this.props.text || "";
        const classNames = ["c-button", "fa"];
        const disabled = this.props.disabled || false;
        if (this.props.faClass) {
            classNames.push(`fa-${this.props.faClass}`);
        }
        if (this.props.additionalClassNames) {
            classNames.push(this.props.additionalClassNames);
        }
        if (disabled) {
            classNames.push("s-disabled");
        }
        return <span
            className={classNames.join(" ")}
            onClick={!disabled && this.props.onClick}
            onMouseOver={!disabled && this.props.onMouseOver}
            title={this.props.tooltip}
        >{text}</span>;
    }
}