import * as React from "react";
import { EncounterCommander } from "../Commands/EncounterCommander";
import { TrackerViewModel } from "../TrackerViewModel";
import { TutorialSpy } from "../Tutorial/TutorialViewModel";
import { LibrariesProps } from "./Components/Libraries";
import { Libraries as LibrariesComponent } from "./Components/Libraries";
import { Libraries } from "./Libraries";

export class LibrariesViewModel {
    private component: React.ComponentElement<any, LibrariesComponent>;
    constructor(
        tracker: TrackerViewModel,
        encounterCommander: EncounterCommander,
        libraries: Libraries
    ){
        const props: LibrariesProps = {
            encounterCommander,
            tracker,
            encounterLibrary: libraries.Encounters
        };
        this.component = React.createElement(LibrariesComponent, props);
    }
}
