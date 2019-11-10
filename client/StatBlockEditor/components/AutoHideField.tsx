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

export function InnerAutoHideField(
  props: AutoHideFieldProps & {
    fieldApi: FieldProps;
  }
) {
  const defaultExpandedState =
    props.fieldApi.form.values[props.fieldName] &&
    props.fieldApi.form.values[props.fieldName].length > 0;

  const [isExpanded, setIsExpanded] = React.useState(defaultExpandedState);

  if (isExpanded) {
    return (
      <div className="autohide-field inline">
        <span
          className="autohide-field__drop-button fa-clickable fa-times"
          onClick={() => {
            setIsExpanded(false);
            props.fieldApi.form.setFieldValue(props.fieldName, "");
          }}
        />
        <div className="autohide-field__children">{props.children}</div>
      </div>
    );
  } else {
    return (
      <span
        className={`autohide-field__open-button fa-clickable fa-${
          props.faClass
        }`}
        title={props.tooltip}
        onClick={() => setIsExpanded(true)}
      />
    );
  }
}
