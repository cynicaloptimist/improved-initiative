import React = require("react");

import { Field, FieldProps } from "formik";

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
  tooltip?: string;
  children: React.ReactNode;
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
          <div className="autohide-field__children">{this.props.children}</div>
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
