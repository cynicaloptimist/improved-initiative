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
        <p>
          <Button fontAwesomeIcon="file-archive" onClick={this.exportData} />
          Export your user data as JSON file
        </p>
        <p>
          <FileUploadButton
            acceptFileType=".json"
            handleFile={this.importDataAndReplace}
          />
          Replace your user data by uploading a JSON file
        </p>
        <p>
          <FileUploadButton
            acceptFileType=".json"
            handleFile={this.importDataAndAdd}
          />
          Import characters, statblocks, encounters and spells from a JSON file
        </p>
        <p>
          <FileUploadButton
            acceptFileType=".xml"
            handleFile={this.importDndAppFile}
          />
          Import statblocks and spells from DnDAppFile
        </p>
        <p>
          <Button
            fontAwesomeIcon="trash"
            onClick={this.confirmClearLocalData}
          />
          Clear all local data
        </p>
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
