import { Field, FieldProps } from "formik";
import * as React from "react";
import { probablyUniqueString } from "../../../common/Toolbox";

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
        <Field name={this.props.fieldName}>
          {(fieldProps: FieldProps) => {
            const stateString = fieldProps.field.value ? "on" : "off";
            return (
              <button
                id={this.id}
                type="button"
                className="c-toggle"
                onClick={() => this.toggle(fieldProps)}
              >
                <span
                  className={"c-toggle__icon fas fa-toggle-" + stateString}
                />
              </button>
            );
          }}
        </Field>
      </div>
    );
  }

  private toggle = (fieldProps: FieldProps) =>
    fieldProps.form.setFieldValue(
      this.props.fieldName,
      !fieldProps.field.value
    );
}
