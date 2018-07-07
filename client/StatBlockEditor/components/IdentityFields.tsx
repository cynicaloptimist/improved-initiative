import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { StatBlock } from "../../../common/StatBlock";
import { Listing } from "../../Library/Listing";

interface IdentityFieldsProps {
    hasFolder: boolean;
    allowFolder: boolean;
    allowSaveAs: boolean;
    currentListings?: Listing<StatBlock>[];
}

interface IdentityFieldsState {
    folderExpanded: boolean;
}

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
            const autoCompletePaths = _.uniq(this.props.currentListings && this.props.currentListings.map(l => l.Path));

            return <div>
                <label className="label" htmlFor="Path">Folder</label>
                <Field type="text" name="Path" />
            </div>;
        } else {
            return <span className="fa-clickable fa-folder" onClick={() => this.setState({ folderExpanded: true })} />;
        }
    }

    public render() {
        return <React.Fragment>
            <div className="inline">
                {this.folderElement()}
                <div>
                    <label className="label" htmlFor="Name">Name</label>
                    <Field type="text" name="Name" id="name" />
                </div>
            </div>
            {this.props.allowSaveAs && <label>Save as a copy <Field type="checkbox" name="SaveAs" /></label>}
        </React.Fragment>;
    }
}