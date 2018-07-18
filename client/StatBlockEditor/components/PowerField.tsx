import { Field } from "formik";
import * as React from "react";

interface PowerFieldProps {
    remove: (index: number) => void;
    powerType: string;
    index: number;
}

interface PowerFieldState { }

export class PowerField extends React.Component<PowerFieldProps, PowerFieldState> {
    private nameInput: HTMLInputElement;

    public componentDidMount() {
        if (this.nameInput.value == "") {
            this.nameInput.focus();
        }
    }

    public render() {
        return <div>
            <div className="inline">
                <Field type="text" className="name" placeholder="Name"
                    name={`${this.props.powerType}[${this.props.index}].Name`}
                    innerRef={f => this.nameInput = f}
                />
                <span className="fa-clickable fa-trash"
                    onClick={() => this.props.remove(this.props.index)}
                />
            </div>
            <Field className="c-statblock-editor__textarea" component="textarea" placeholder="Details" name={`${this.props.powerType}[${this.props.index}].Content`} />
        </div>;
    }
}