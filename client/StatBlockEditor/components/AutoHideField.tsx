import React = require("react");

import { FormikProps } from "formik";
import { AutocompleteTextInput } from "./AutocompleteTextInput";

interface AutoHideFieldProps {
  faClass: string;
  fieldName: string;
  label: string;
  tooltip?: string;
  formApi: FormikProps<any>;
  autoCompleteOptions?: string[];
}

interface AutoHideFieldState {
  isExpanded: boolean;
}

export class AutoHideField extends React.Component<
  AutoHideFieldProps,
  AutoHideFieldState
> {
  constructor(props) {
    super(props);
    const isExpanded =
      this.props.formApi.values[this.props.fieldName] &&
      this.props.formApi.values[this.props.fieldName].length > 0;
    this.state = {
      isExpanded
    };
  }

  public render() {
    if (this.state.isExpanded) {
      return (
        <div className="inline">
          <span
            className="statblock-editor__folder-button fa-clickable fa-times"
            onClick={() => {
              this.setState({ isExpanded: false });
              this.props.formApi.setFieldValue(this.props.fieldName, "");
            }}
          />
          <div>
            <label className="label" htmlFor={this.props.fieldName}>
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
          className={`statblock-editor__folder-button fa-clickable fa-${
            this.props.faClass
          }`}
          title={this.props.tooltip}
          onClick={() => this.setState({ isExpanded: true })}
        />
      );
    }
  }
}
