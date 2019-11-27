import Tippy, { TippyProps } from "@tippy.js/react";
import * as React from "react";

export interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLSpanElement>;
  onMouseOver?: React.MouseEventHandler<HTMLSpanElement>;

  additionalClassNames?: string;
  fontAwesomeIcon?: string;
  text?: string;
  tooltip?: string;
  tooltipProps?: Omit<TippyProps, "children" | "content">;
  disabled?: boolean;
}

export class Button extends React.Component<ButtonProps> {
  public render() {
    const text = this.props.text || "";

    const disabled = this.props.disabled || false;

    const classNames = ["c-button"];

    if (disabled) {
      classNames.push("c-button--disabled");
    }
    if (this.props.fontAwesomeIcon && this.props.text) {
      classNames.push("c-button--icon-and-text");
    }
    if (this.props.additionalClassNames) {
      classNames.push(this.props.additionalClassNames);
    }

    const faElement = this.props.fontAwesomeIcon && (
      <span className={`fas fa-${this.props.fontAwesomeIcon}`} />
    );

    const button = (
      <button
        type="button"
        className={classNames.join(" ")}
        onClick={!disabled && this.props.onClick}
        onMouseOver={!disabled && this.props.onMouseOver}
      >
        {faElement}
        {text}
      </button>
    );

    if (this.props.tooltip) {
      return (
        <Tippy content={this.props.tooltip} {...this.props.tooltipProps}>
          {button}
        </Tippy>
      );
    } else {
      return button;
    }
  }
}

interface SubmitButtonProps {
  faClass?: string;
  beforeSubmit?: () => boolean;
}

export class SubmitButton extends React.Component<SubmitButtonProps> {
  public render() {
    const faClass = this.props.faClass || "check";
    const beforeSubmit = this.props.beforeSubmit || (() => true);
    return (
      <button
        type="submit"
        className={`c-button fas fa-${faClass} button`}
        onClick={beforeSubmit}
      />
    );
  }
}
