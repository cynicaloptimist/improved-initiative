
import * as React from "react";
import { EncounterCommander } from "../../Commands/EncounterCommander";
import { Button } from "../../Components/Button";
import { Tabs } from "../../Components/Tabs";
import { TrackerViewModel } from "../../TrackerViewModel";
import { EncounterLibrary } from "../EncounterLibrary";
import { EncounterLibraryViewModel } from "./EncounterLibraryViewModel";


export interface LibrariesProps {
    encounterCommander: EncounterCommander;
    tracker: TrackerViewModel;
    encounterLibrary: EncounterLibrary;
}

interface LibrariesState {
    selectedLibrary: string;
}
 
export class Libraries extends React.Component<LibrariesProps, LibrariesState> {
    constructor(props) {
        super(props);
        this.state = {
            selectedLibrary: "Creatures"
        };
    }

    private hideLibraries = () => this.props.encounterCommander.HideLibraries();
    private selectLibrary = (library: string) => this.setState({ selectedLibrary: library });
    
    public render() {
        const libraries = {
            Creatures: <div>Creatures</div>,
            Players: <div>Players</div>,
            Encounters: <EncounterLibraryViewModel tracker={this.props.tracker} library={this.props.encounterLibrary} />,
            Spells: <div>Spells</div>,
        };


        return <React.Fragment>
            <h2>Library</h2>
            <Button faClass="close" onClick={this.hideLibraries} />
            <Tabs options={Object.keys(libraries)} onChoose={this.selectLibrary} />
            {libraries[this.state.selectedLibrary]}
        </React.Fragment>;
    }
}
