import { Field } from "formik";
import * as React from "react";

interface IdentityFieldsProps { hasFolder: boolean; allowFolder: boolean; allowSaveAs: boolean; }

interface IdentityFieldsState { folderExpanded: boolean; }

export class IdentityFields extends React.Component<IdentityFieldsProps, IdentityFieldsState> {
    constructor(props) {
        super(props);
        this.state = {
            folderExpanded: this.props.hasFolder
        };
    }

    private folderElement = () => {
        if (!this.props.allowFolder) {
            return null;
        }
        if (this.state.folderExpanded) {
            return <Field type="text" name="Path" />;
        } else {
            return <span className="fa-clickable fa-folder" onClick={() => this.setState({ folderExpanded: true })} />;
        }
    }

    public render() {
        return <React.Fragment>
            <label className="label" htmlFor="name">Folder and Name</label>
            <span>
                {this.folderElement()}
                <Field type="text" name="Name" id="name" />
            </span>
            {this.props.allowSaveAs && <label>Save as a copy <Field type="checkbox" name="SaveAs" /></label>}
        </React.Fragment>;
    }
}