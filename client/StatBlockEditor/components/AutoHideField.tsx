import React = require("react");

import { Field, FieldProps } from "formik";
import { AutocompleteTextInput } from "./AutocompleteTextInput";

export function AutoHideField(props: AutoHideFieldProps) {
  return (
    <Field
      name={props.fieldName}
      render={(fieldApi: FieldProps) => (
        <InnerAutoHideField {...props} fieldApi={fieldApi} />
      )}
    />
  );
}

interface AutoHideFieldProps {
  faClass: string;
  fieldName: string;
  label: string;
  tooltip?: string;
  autoCompleteOptions?: string[];
}

interface AutoHideFieldState {
  isExpanded: boolean;
}

export class InnerAutoHideField extends React.Component<
  AutoHideFieldProps & {
    fieldApi: FieldProps;
  },
  AutoHideFieldState
> {
  constructor(props) {
    super(props);
    const isExpanded =
      this.props.fieldApi.form.values[this.props.fieldName] &&
      this.props.fieldApi.form.values[this.props.fieldName].length > 0;
    this.state = {
      isExpanded
    };
  }

  public render() {
    if (this.state.isExpanded) {
      return (
        <div className="autohide-field inline">
          <span
            className="autohide-field__drop-button fa-clickable fa-times"
            onClick={() => {
              this.setState({ isExpanded: false });
              this.props.fieldApi.form.setFieldValue(this.props.fieldName, "");
            }}
          />

          <div>
            <label
              className="autohide-field__label label"
              htmlFor={this.props.fieldName}
            >
              {this.props.label}
            </label>
            <AutocompleteTextInput
              fieldName={this.props.fieldName}
              options={this.props.autoCompleteOptions}
              autoFocus
            />
          </div>
        </div>
      );
    } else {
      return (
        <span
          className={`autohide-field__open-button fa-clickable fa-${
            this.props.faClass
          }`}
          title={this.props.tooltip}
          onClick={() => this.setState({ isExpanded: true })}
        />
      );
    }
  }
}
