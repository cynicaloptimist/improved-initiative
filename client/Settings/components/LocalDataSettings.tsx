import { saveAs } from "browser-filesaver";
import * as React from "react";
import { Button } from "../../Components/Button";
import { Store } from "../../Utility/Store";

const FileUploadButton = (props: {
  handleFile: (file: File) => void;
  acceptFileType: string;
}) => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (file) {
      props.handleFile(file);
    }
  };

  return (
    <label>
      <input
        className="hidden-file-input"
        type="file"
        accept={props.acceptFileType}
        onChange={onChange}
      />
      <span className="c-button fas fa-upload" />
    </label>
  );
};

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
            handleFile={this.importData}
          />
          Import an exported user data JSON file
        </p>
        <p>
          <FileUploadButton
            acceptFileType=".xml"
            handleFile={this.importDndAppFile}
          />
          Import statblocks and spells from DnDAppFile
        </p>
      </React.Fragment>
    );
  }

  private exportData = () => {
    let blob = Store.ExportAll();
    saveAs(blob, "improved-initiative.json");
  };

  private importData = (file: File) => {
    Store.ImportAll(file);
  };

  private importDndAppFile = (file: File) => {
    Store.ImportFromDnDAppFile(file);
  };
}
