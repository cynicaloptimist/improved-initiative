
import * as React from "react";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { Tabs } from "../../Components/Tabs";
import { env } from "../../Environment";
import { StatBlockTextEnricher } from "../../StatBlock/StatBlockTextEnricher";
import { TutorialSpy } from "../../Tutorial/TutorialViewModel";
import { Libraries as LibrarySet } from "../Libraries";
import { EncounterLibraryViewModel } from "./EncounterLibraryViewModel";
import { SpellLibraryViewModel } from "./SpellLibraryViewModel";
import { StatBlockLibraryViewModel } from "./StatBlockLibraryViewModel";


export interface LibrariesProps {
    librariesCommander: LibrariesCommander;
    statBlockTextEnricher: StatBlockTextEnricher;
    libraries: LibrarySet;
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

    private hideLibraries = () => this.props.librariesCommander.HideLibraries();
    private selectLibrary = (library: string) => {
        if (library == "Players") {
            TutorialSpy("SelectPlayersTab");
        }
        this.setState({ selectedLibrary: library });
    }

    public render() {
        const libraries = {
            Creatures: <StatBlockLibraryViewModel
                key="creatures"
                librariesCommander={this.props.librariesCommander}
                library={this.props.libraries.NPCs}
                statBlockTextEnricher={this.props.statBlockTextEnricher} />,
            Players: <StatBlockLibraryViewModel
                key="players"
                librariesCommander={this.props.librariesCommander}
                library={this.props.libraries.PCs}
                statBlockTextEnricher={this.props.statBlockTextEnricher} />,
            Encounters: <EncounterLibraryViewModel
                librariesCommander={this.props.librariesCommander}
                library={this.props.libraries.Encounters} />,
            Spells: <SpellLibraryViewModel
                librariesCommander={this.props.librariesCommander}
                library={this.props.libraries.Spells} />,
        };

        const selectedLibrary = libraries[this.state.selectedLibrary];

        const hasAccountSync = env.HasStorage;

        return <React.Fragment>
            <h2>{hasAccountSync && <span className="fa fa-cloud" title="Account Sync is enabled" />} Library</h2>
            <Button faClass="close" onClick={this.hideLibraries} />
            <Tabs options={Object.keys(libraries)} onChoose={this.selectLibrary} selected={this.state.selectedLibrary} />
            {selectedLibrary}
        </React.Fragment>;
    }
}
