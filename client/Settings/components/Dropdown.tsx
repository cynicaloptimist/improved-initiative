import { Field } from "formik";
import * as _ from "lodash";
import React = require("react");

export const Dropdown = (props: {
  fieldName: string;
  options: {};
  children: any;
}) => (
  <div className="c-dropdown">
    <span>{props.children}</span>
    <SelectOptions {...props} />
  </div>
);

const SelectOptions = (props: { fieldName: string; options: {} }) => (
  <Field component="select" name={props.fieldName}>
    {_.values<string>(props.options).map(option => (
      <option value={option} key={option}>
        {option}
      </option>
    ))}
  </Field>
);
