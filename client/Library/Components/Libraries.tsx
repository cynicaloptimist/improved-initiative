
import * as React from "react";
import { EncounterCommander } from "../../Commands/EncounterCommander";
import { Button } from "../../Components/Button";
import { TrackerViewModel } from "../../TrackerViewModel";
import { EncounterLibrary } from "../EncounterLibrary";
import { EncounterLibraryViewModel } from "./EncounterLibraryViewModel";

export interface LibrariesProps {
    encounterCommander: EncounterCommander;
    tracker: TrackerViewModel;
    encounterLibrary: EncounterLibrary;
}

interface LibrariesState { }
export class Libraries extends React.Component<LibrariesProps, LibrariesState> {
    constructor(props) {
        super(props);
    }

    private hideLibraries = () => this.props.encounterCommander.HideLibraries();

    public render() {
        const selectedLibrary = <EncounterLibraryViewModel tracker={this.props.tracker} library={this.props.encounterLibrary} />

        return <React.Fragment>
            <h2>Library</h2>
            <Button faClass="close" onClick={this.hideLibraries} />
            <Tabs />
            {selectedLibrary}
        </React.Fragment>;
    }
}

interface TabsProps {}
interface TabsState {}
class Tabs extends React.Component<TabsProps, TabsState> {
    constructor(props) {
        super(props);
    }
    public render() {
        return "";
    }
}