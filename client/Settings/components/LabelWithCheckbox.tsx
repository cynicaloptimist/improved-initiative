import * as React from "react";
import { probablyUniqueString } from "../../../common/Toolbox";

interface LabelWithCheckboxProps {
    text: string;
    checked: boolean;
    toggle: (newState: boolean) => void;
}

export class LabelWithCheckbox extends React.Component<LabelWithCheckboxProps, {}> {
    private id: string;

    public componentWillMount() {
        this.id = `toggle_${probablyUniqueString()}`;
    }
    
    public render() {
        let className = "c-checkbox-label";
        if (this.props.checked) {
            className += " s-checked";
        }

        return <p><label className={className} htmlFor={this.id}>{this.props.text}</label><input id={this.id} type="checkbox" onChange={this.onChange}/></p>;
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.toggle(e.currentTarget.checked);
    }
}