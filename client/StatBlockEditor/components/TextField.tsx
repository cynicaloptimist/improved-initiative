import { Field } from "formik";
import * as React from "react";

export const TextField = (props: { label: string; fieldName: string }) => (
  <label className="c-text-field inline">
    <div className="label">{props.label}</div>
    <Field type="text" name={props.fieldName} />
  </label>
);
