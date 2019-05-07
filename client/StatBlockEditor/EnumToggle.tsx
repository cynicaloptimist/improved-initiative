import { Field, FieldProps } from "formik";
import * as React from "react";
import { Button } from "../Components/Button";

export class EnumToggle extends React.Component<EnumToggleProps> {
  public render() {
    return (
      <Field name={this.props.fieldName}>
        {(fieldProps: FieldProps) => {
          const buttonLabel =
            this.props.labelsByOption[fieldProps.field.value] || "UNKNOWN";
          return (
            <Button
              text={buttonLabel}
              onClick={() => this.toggle(fieldProps)}
            />
          );
        }}
      </Field>
    );
  }

  private toggle = (fieldProps: FieldProps) => {
    const allOptions = Object.keys(this.props.labelsByOption);
    const nextOptionIndex =
      (allOptions.indexOf(fieldProps.field.value) + 1) % allOptions.length;
    fieldProps.form.setFieldValue(
      this.props.fieldName,
      allOptions[nextOptionIndex]
    );
  };
}

interface EnumToggleProps {
  labelsByOption: {
    [value: string]: string;
  };
  fieldName: string;
}
