import Tippy, { TippyProps } from "@tippyjs/react";
import * as React from "react";
import { FieldProps, Field } from "formik";

export interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseOver?: React.MouseEventHandler<HTMLButtonElement>;

  additionalClassNames?: string;
  fontAwesomeIcon?: string;
  text?: string;
  tooltip?: string;
  tooltipProps?: Omit<TippyProps, "children" | "content">;

  type?: "button" | "submit";
  disabled?: boolean;
}

export function Button(props: ButtonProps) {
  const text = props.text || "";

  const classNames = ["c-button"];

  if (props.disabled) {
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
      onClick={!props.disabled && props.onClick}
      onMouseOver={!props.disabled && props.onMouseOver}
      tabIndex={props.disabled ? -1 : 0}
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

export function SubmitButton(
  props: ButtonProps & { bindModel?: [string, any] }
) {
  const buttonProps: ButtonProps = {
    ...props,
    type: "submit",
    fontAwesomeIcon: props.fontAwesomeIcon ?? "check",
    onClick: props.onClick || (() => true)
  };

  if (props.bindModel) {
    return (
      <Field>
        {(formik: FieldProps) => (
          <Button
            {...buttonProps}
            onClick={e => {
              if (buttonProps.disabled) {
                return;
              }
              formik.form.setFieldValue(props.bindModel[0], props.bindModel[1]);
              buttonProps.onClick(e);
            }}
          />
        )}
      </Field>
    );
  } else {
    return <Button {...buttonProps} />;
  }
}
