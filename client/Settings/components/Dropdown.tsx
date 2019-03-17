import { Field } from "formik";
import React = require("react");

export const Dropdown = (props: {
  fieldName: string;
  options: {};
  children: any;
}) => (
  <div className="c-dropdown">
    {props.children}
    <SelectOptions {...props} />
  </div>
);

const SelectOptions = (props: { fieldName: string; options: {} }) => (
  <Field component="select" name={props.fieldName}>
    {Object.keys(props.options).map(option => (
      <option value={option} key={option}>
        {props.options[option]}
      </option>
    ))}
  </Field>
);
