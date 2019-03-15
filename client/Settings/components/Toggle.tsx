import { Field, FieldProps } from "formik";
import * as React from "react";
import { probablyUniqueString } from "../../../common/Toolbox";

interface ToggleProps {
  text: string;
  fieldName: string;
}

export class Toggle extends React.Component<ToggleProps> {
  private id: string;

  public componentWillMount() {
    this.id = `toggle_${probablyUniqueString()}`;
  }

  public render() {
    return (
      <Field name={this.props.fieldName}>
        {(fieldProps: FieldProps) => (
          <div
            onClick={() =>
              fieldProps.form.setFieldValue(
                this.props.fieldName,
                !fieldProps.field.value
              )
            }
          >
            {this.props.text}
            {fieldProps.field.value ? " [ON]" : " [OFF]"}
          </div>
        )}
      </Field>
    );
  }
}
