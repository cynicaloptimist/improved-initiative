import Awesomplete = require("awesomplete");
import { Field, FieldProps } from "formik";
import * as _ from "lodash";
import * as React from "react";

class InnerAwesomeplete extends React.Component<{
  fieldName: string;
  options: string[];
  fieldProps: FieldProps<any>;
}> {
  private inputField: HTMLInputElement;

  public componentDidMount() {
    const awesomeplete = new Awesomplete(this.inputField, {
      list: this.props.options,
      minChars: 1
    });

    this.inputField.addEventListener("awesomplete-select", (event: any) => {
      this.props.fieldProps.form.setFieldValue(
        this.props.fieldName,
        event.text.value
      );
      event.preventDefault();
      awesomeplete.close();
    });
  }

  public render() {
    return (
      <input
        {...this.props.fieldProps.field}
        type="text"
        ref={i => (this.inputField = i)}
      />
    );
  }
}

export function AutocompleteTextInput(props: {
  fieldName: string;
  options: string[];
}) {
  return (
    <Field
      name={props.fieldName}
      render={fieldProps => (
        <InnerAwesomeplete {...props} fieldProps={fieldProps} />
      )}
    />
  );
}
