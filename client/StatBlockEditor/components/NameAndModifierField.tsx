import { Field } from "formik";
import * as React from "react";

interface NameAndModifierFieldProps {
    remove: (index: number) => void;
    modifierType: string; index: number;
}
interface NameAndModifierFieldState { }

export class NameAndModifierField extends React.Component<NameAndModifierFieldProps, NameAndModifierFieldState> {
    private nameInput: HTMLInputElement;

    public componentDidMount() {
        if (this.nameInput.value == "") {
            this.nameInput.focus();
        }
    }

    public render() {
        return <div>
            <Field type="text" className="name"
                name={`${this.props.modifierType}[${this.props.index}].Name`}
                innerRef={f => this.nameInput = f}
            />
            <Field type="number" className="modifier"
                name={`${this.props.modifierType}[${this.props.index}].Modifier`}
            />
            <span
                className="fa-clickable fa-trash"
                onClick={() => this.props.remove(this.props.index)}
            />
        </div>;
    }
}
