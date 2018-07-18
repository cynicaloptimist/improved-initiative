import { Field } from "formik";
import * as React from "react";

interface KeywordFieldProps {
    remove: (index: number) => void;
    keywordType: string;
    index: number;
}

interface KeywordFieldState { }

export class KeywordField extends React.Component<KeywordFieldProps, KeywordFieldState> {
    private nameInput: HTMLInputElement;

    public componentDidMount() {
        if (this.nameInput.value == "") {
            this.nameInput.focus();
        }
    }

    public render() {
        return <div className="inline">
            <Field type="text" className="name"
                name={`${this.props.keywordType}[${this.props.index}]`}
                innerRef={f => this.nameInput = f}
            />
            <span className="fa-clickable fa-trash"
                onClick={() => this.props.remove(this.props.index)}
            />
        </div>;
    }
}