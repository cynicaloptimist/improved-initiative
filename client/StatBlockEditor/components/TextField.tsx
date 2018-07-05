import { Field } from "formik";
import * as React from "react";

export const TextField = (props: { label: string, fieldName: string }) =>
    <label className="c-statblock-editor-text">
        <span className="label">{props.label}</span>
        <Field type="text" name={props.fieldName} />
    </label>;
