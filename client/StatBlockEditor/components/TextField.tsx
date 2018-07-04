import * as React from "react";
import { Text } from "react-form";

export const TextField = (props: { label: string, fieldName: string }) =>
    <label className="c-statblock-editor-text">
        <span className="label">{props.label}</span>
        <Text field={props.fieldName} />
    </label>;
