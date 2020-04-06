import Tippy, { TippyProps } from "@tippy.js/react";
import * as React from "react";

export interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  onMouseOver?: React.MouseEventHandler<HTMLSpanElement>;

  additionalClassNames?: string;
  fontAwesomeIcon?: string;
  text?: string;
  tooltip?: string;
  tooltipProps?: Omit<TippyProps, "children" | "content">;

  type?: "button" | "submit"
  disabled?: boolean;
}

export function Button(props: ButtonProps) {
  const text = props.text || "";

  const disabled = props.disabled || false;

  const classNames = ["c-button"];

  if (disabled) {
    classNames.push("c-button--disabled");
  }
  if (props.fontAwesomeIcon && props.text) {
    classNames.push("c-button--icon-and-text");
  }
  if (props.additionalClassNames) {
    classNames.push(props.additionalClassNames);
  }

  const faElement = props.fontAwesomeIcon && (
    <span className={`fas fa-${props.fontAwesomeIcon}`} />
  );

  const button = (
    <button
      type={props.type ?? "button"}
      className={classNames.join(" ")}
      onClick={!disabled && props.onClick}
      onMouseOver={!disabled && props.onMouseOver}
    >
      {faElement}
      {text}
    </button>
  );

  if (props.tooltip) {
    return (
      <Tippy content={props.tooltip} {...props.tooltipProps}>
        {button}
      </Tippy>
    );
  } else {
    return button;
  }
}

export function SubmitButton(props: ButtonProps) {
  const fontAwesomeIcon = props.fontAwesomeIcon || "check";
  const onClick = props.onClick || (() => true);
  return (
    <button
      type="submit"
      className={`c-button fas fa-${fontAwesomeIcon} button`}
      onClick={onClick}
    />
  );
}
