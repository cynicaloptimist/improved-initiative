import React = require("react");
import { Text } from "react-form";

export const TextField = (props: { label: string, fieldName: string }) =>
    <label className="c-statblock-editor-text">
        <div className="label">{props.label}</div>
        <Text field={props.fieldName} />
    </label>;
