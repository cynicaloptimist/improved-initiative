import { Field, FormikProps } from "formik";
import * as _ from "lodash";
import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { Listing } from "../../Library/Listing";
import { Toggle } from "../../Settings/components/Toggle";
import { AutoHideField } from "./AutoHideField";

interface IdentityFieldsProps {
  formApi: FormikProps<any>;
  allowFolder: boolean;
  allowSaveAs: boolean;
  setEditorMode: (editorMode: "standard" | "json") => void;
  currentListings?: Listing<Listable>[];
}

export class IdentityFields extends React.Component<IdentityFieldsProps> {
  private autoCompletePaths: string[];

  constructor(props) {
    super(props);
    this.autoCompletePaths = _.uniq(
      this.props.currentListings &&
        this.props.currentListings.map(l => l.Listing().Path)
    );
  }

  public render() {
    return (
      <React.Fragment>
        <div className="c-statblock-editor__path-and-name">
          {this.folderElement()}
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <Field type="text" name="Name" id="name" />
          </div>
        </div>
        {this.props.allowSaveAs && (
          <div className="c-statblock-editor__save-as">
            <Toggle fieldName="SaveAs">Save as a copy</Toggle>
            {this.props.formApi.errors.PathAndName}
          </div>
        )}
        <div className="c-statblock-editor__mode-toggle">
          <label>Editor Mode:</label>
          <Button
            onClick={() => this.props.setEditorMode("standard")}
            text="Standard"
          />
          <Button
            additionalClassNames="c-statblock-editor__json-button"
            onClick={() => this.props.setEditorMode("json")}
            text="JSON"
          />
        </div>
      </React.Fragment>
    );
  }

  private folderElement = () => {
    if (!this.props.allowFolder) {
      return null;
    }
    return (
      <AutoHideField
        faClass="folder"
        fieldName="Path"
        formApi={this.props.formApi}
        label="Folder: "
        tooltip="Add to folder"
        autoCompleteOptions={this.autoCompletePaths}
      />
    );
  };
}
