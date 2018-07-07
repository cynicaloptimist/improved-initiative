import { Field } from "formik";
import * as React from "react";

interface PowerFieldProps {
    remove: (index: number) => void;
    powerType: string;
    index: number;
}

interface PowerFieldState { }

export class PowerField extends React.Component<PowerFieldProps, PowerFieldState> {
    public render() {
        return <div>
            <div className="inline">
                <Field type="text" className="name" placeholder="Name"
                    name={`${this.props.powerType}[${this.props.index}].Name`}
                />
                <span className="fa-clickable fa-trash"
                    onClick={() => this.props.remove(this.props.index)}
                />
            </div>
            <Field component="textarea" placeholder="Details" name={`${this.props.powerType}[${this.props.index}].Content`} />
        </div>;
    }
}