import { saveAs } from "browser-filesaver";
import * as React from "react";
import { Button } from "../../Components/Button";
import { LegacySynchronousLocalStore } from "../../Utility/LegacySynchronousLocalStore";
import { Store } from "../../Utility/Store";
import { FileUploadButton } from "./FileUploadButton";

export class LocalDataSettings extends React.Component<{}> {
  public render() {
    return (
      <>
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
      </>
    );
  }

  private exportData = async () => {
    const asyncKeys = await Store.GetAllKeys();
    let blob = LegacySynchronousLocalStore.ExportAll(asyncKeys);
    saveAs(blob, "improved-initiative.json");
  };

  private importDataAndReplace = async (file: File) => {
    if (
      confirm(
        `Replace your Improved Initiative data with imported ${
          file.name
        } and reload?`
      )
    ) {
      await Store.DeleteAll();
      await Store.ImportAll(file);
      LegacySynchronousLocalStore.ImportAllAndReplace(file);
      location.reload();
    }
  };

  private importDataAndAdd = async (file: File) => {
    if (
      confirm(`Import all statblocks and spells in ${file.name} and reload?`)
    ) {
      await Store.ImportAll(file);
      LegacySynchronousLocalStore.ImportAll(file);
      location.reload();
    }
  };

  private importDndAppFile = (file: File) => {
    LegacySynchronousLocalStore.ImportFromDnDAppFile(file);
  };

  private confirmClearLocalData = async () => {
    const promptText =
      "To clear all of your saved player characters, statblocks, encounters, and settings, enter DELETE.";
    if (prompt(promptText) == "DELETE") {
      await Store.DeleteAll();
      LegacySynchronousLocalStore.DeleteAll();
      location.reload();
    }
  };
}
