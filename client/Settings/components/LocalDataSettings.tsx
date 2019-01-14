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
      <span className="c-button fas fa-file-upload" />
    </label>
  );
};

export class LocalDataSettings extends React.Component<{}> {
  public render() {
    return (
      <React.Fragment>
        <h3>Local Data</h3>
        <p>
          Export your user data as JSON:
          <Button text="Download File" onClick={this.exportData} />
        </p>
        <p>
          Import an exported user data file:
          <FileUploadButton
            acceptFileType=".json"
            handleFile={this.importData}
          />
        </p>
        <p>
          Import statblocks and spells from DnDAppFile:
          <FileUploadButton
            acceptFileType=".xml"
            handleFile={this.importDndAppFile}
          />
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
