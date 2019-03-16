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
          <Button fontAwesomeIcon="file-archive" onClick={this.exportData} />
          <span>Export your user data as JSON file</span>
        </div>
        <div className="c-button-with-label">
          <FileUploadButton
            acceptFileType=".json"
            fontAwesomeIcon="recycle"
            handleFile={this.importDataAndReplace}
          />
          <span>Replace your user data by uploading a JSON file</span>
        </div>
        <div className="c-button-with-label">
          <FileUploadButton
            acceptFileType=".json"
            fontAwesomeIcon="upload"
            handleFile={this.importDataAndAdd}
          />
          <span>
            Import characters, statblocks, encounters and spells from a JSON
            file
          </span>
        </div>
        <div className="c-button-with-label">
          <FileUploadButton
            acceptFileType=".xml"
            fontAwesomeIcon="code"
            handleFile={this.importDndAppFile}
          />
          <span>Import statblocks and spells from DnDAppFile</span>
        </div>
        <div className="c-button-with-label">
          <Button
            fontAwesomeIcon="trash"
            onClick={this.confirmClearLocalData}
          />
          <span>Clear all local data</span>
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
