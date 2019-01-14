import { saveAs } from "browser-filesaver";
import * as React from "react";
import { Button } from "../../Components/Button";
import { Store } from "../../Utility/Store";

const FileInput = (props: {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  acceptFileType: string;
}) => {
  return (
    <label>
      <input
        className="hidden-file-input"
        type="file"
        accept={props.acceptFileType}
        onChange={props.onChange}
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
          <FileInput acceptFileType=".json" onChange={this.importData} />
        </p>
        <p>
          Import statblocks and spells from DnDAppFile:
          <FileInput acceptFileType=".xml" onChange={this.importDndAppFile} />
        </p>
      </React.Fragment>
    );
  }

  private exportData = () => {
    let blob = Store.ExportAll();
    saveAs(blob, "improved-initiative.json");
  };

  private importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files[0];
    if (file) {
      Store.ImportAll(file);
    }
  };

  private importDndAppFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files[0];
    if (file) {
      Store.ImportFromDnDAppFile(file);
    }
  };
}
