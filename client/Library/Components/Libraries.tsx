
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
        const selectedLibrary = <EncounterLibraryViewModel tracker={this.props.tracker} library={this.props.encounterLibrary} />;
        const libraryOptions = ["Creatures", "Players", "Encounters", "Spells"];

        return <React.Fragment>
            <h2>Library</h2>
            <Button faClass="close" onClick={this.hideLibraries} />
            <Tabs options={libraryOptions} onChoose={o => console.log(o)} />
            {selectedLibrary}
        </React.Fragment>;
    }
}

interface TabsProps {
    options: string[];
    selected?: string;
    onChoose: (option: string) => void;
}
interface TabsState {}
class Tabs extends React.Component<TabsProps, TabsState> {
    constructor(props) {
        super(props);
    }
    public render() {
        const spanElements = this.props.options.map(
            option => <span onClick={() => this.props.onChoose(option)}>{option}</span>
        );

        return <div className="c-tabs">
            {spanElements}
        </div>;
    }
}