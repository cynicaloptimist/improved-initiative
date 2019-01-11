import { saveAs } from "browser-filesaver";
import * as React from "react";
import { Button } from "../../Components/Button";
import { Store } from "../../Utility/Store";

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
          <input type="file" accept=".json" onChange={this.importData} />
        </p>
        <p>
          Import statblocks and spells from DnDAppFile:
          <input type="file" accept=".xml" onChange={this.importDndAppFile} />
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
