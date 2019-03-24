import { saveAs } from "browser-filesaver";
import * as React from "react";
import { Button } from "../../Components/Button";
import { Store } from "../../Utility/Store";
import { FileUploadButton } from "./FileUploadButton";

export class LocalDataSettings extends React.Component<{}> {
  public render() {
    return (
      <React.Fragment>
        <h3>Local Data</h3>
        <div className="c-button-with-label">
          <span>Export your user data as JSON file</span>
          <Button fontAwesomeIcon="file-archive" onClick={this.exportData} />
        </div>
        <div className="c-button-with-label">
          <span>Replace your user data by uploading a JSON file</span>
          <FileUploadButton
            acceptFileType=".json"
            fontAwesomeIcon="recycle"
            handleFile={this.importDataAndReplace}
          />
        </div>
        <div className="c-button-with-label">
          <span>
            Import characters, statblocks, encounters and spells from a JSON
            file
          </span>
          <FileUploadButton
            acceptFileType=".json"
            fontAwesomeIcon="upload"
            handleFile={this.importDataAndAdd}
          />
        </div>
        <div className="c-button-with-label">
          <span>Import statblocks and spells from DnDAppFile</span>
          <FileUploadButton
            acceptFileType=".xml"
            fontAwesomeIcon="code"
            handleFile={this.importDndAppFile}
          />
        </div>
        <div className="c-button-with-label">
          <span>Clear all local data</span>
          <Button
            fontAwesomeIcon="trash"
            onClick={this.confirmClearLocalData}
          />
        </div>
      </React.Fragment>
    );
  }

  private exportData = () => {
    let blob = Store.ExportAll();
    saveAs(blob, "improved-initiative.json");
  };

  private importDataAndReplace = (file: File) => {
    Store.ImportAllAndReplace(file);
  };

  private importDataAndAdd = (file: File) => {
    Store.ImportAll(file);
  };

  private importDndAppFile = (file: File) => {
    Store.ImportFromDnDAppFile(file);
  };

  private confirmClearLocalData = () => {
    const promptText =
      "To clear all of your saved player characters, statblocks, encounters, and settings, enter DELETE.";
    if (prompt(promptText) == "DELETE") {
      Store.DeleteAll();
    }
  };
}
