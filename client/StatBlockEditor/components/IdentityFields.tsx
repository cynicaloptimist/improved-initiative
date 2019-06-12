import { Field, FormikProps } from "formik";
import * as _ from "lodash";
import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { Listing } from "../../Library/Listing";
import { Toggle } from "../../Settings/components/Toggle";
import { AutoHideField } from "./AutoHideField";
import { AutocompleteTextInput } from "./AutocompleteTextInput";

interface IdentityFieldsProps {
  formApi: FormikProps<any>;
  allowFolder: boolean;
  allowSaveAsCopy: boolean;
  allowSaveAsCharacter: boolean;
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
    const showSaveAs =
      this.props.allowSaveAsCopy || this.props.allowSaveAsCharacter;
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
        {showSaveAs && (
          <div className="c-statblock-editor__save-as">
            {this.props.allowSaveAsCopy && (
              <Toggle
                fieldName="SaveAs"
                disabled={this.props.formApi.values.SaveAsCharacter}
              >
                Save as a copy
              </Toggle>
            )}
            {this.props.formApi.errors.PathAndName}
            {this.props.allowSaveAsCharacter && (
              <Toggle
                fieldName="SaveAsCharacter"
                disabled={this.props.formApi.values.SaveAs}
              >
                Save as a <strong>Character</strong>
              </Toggle>
            )}
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
      <AutoHideField faClass="folder" fieldName="Path" tooltip="Add to folder">
        <label className="autohide-field__label label" htmlFor="Path">
          {"Folder: "}
        </label>
        <AutocompleteTextInput
          fieldName="Path"
          options={this.autoCompletePaths}
          autoFocus
        />
      </AutoHideField>
    );
  };
}
