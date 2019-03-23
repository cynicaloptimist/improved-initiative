import { Field, FieldProps } from "formik";
import * as React from "react";
import { probablyUniqueString } from "../../../common/Toolbox";

interface ToggleButtonProps {
  fieldName: string;
  id?: string;
  disabled?: boolean;
}

export class ToggleButton extends React.Component<ToggleButtonProps> {
  public render() {
    return (
      <Field name={this.props.fieldName}>
        {(fieldProps: FieldProps) => {
          const stateString = fieldProps.field.value
            ? "fas fa-check-circle"
            : "far fa-circle";
          return (
            <button
              id={this.props.id}
              disabled={this.props.disabled}
              type="button"
              className="c-toggle"
              onClick={() => this.toggle(fieldProps)}
            >
              <span className={"c-toggle__icon " + stateString} />
            </button>
          );
        }}
      </Field>
    );
  }

  private toggle = (fieldProps: FieldProps) => {
    if (this.props.disabled) {
      return;
    }

    fieldProps.form.setFieldValue(
      this.props.fieldName,
      !fieldProps.field.value
    );
  };
}

interface ToggleProps {
  fieldName: string;
}

export class Toggle extends React.Component<ToggleProps> {
  private id: string;

  public componentWillMount() {
    this.id = `toggle_${probablyUniqueString()}`;
  }

  public render() {
    return (
      <div className="c-button-with-label">
        <label className="c-toggle__label" htmlFor={this.id}>
          {this.props.children}
        </label>
        <ToggleButton fieldName={this.props.fieldName} id={this.id} />
      </div>
    );
  }
}
