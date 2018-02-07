import * as React from "react";
import { SavedCombatant, SavedEncounter } from "../Encounter/SavedEncounter";
import { TrackerViewModel } from "../TrackerViewModel";
import { EncounterLibraryViewModel } from "./Components/EncounterLibraryViewModel";
import { EncounterLibrary } from "./EncounterLibrary";
import { Listing } from "./Listing";

export class EncounterLibraryViewModelWrapper {
    constructor(tracker: TrackerViewModel, library: EncounterLibrary) {
        const props = {
            library,
            tracker
        };
        this.component = React.createElement(EncounterLibraryViewModel, props);
    }
    public component: React.ComponentElement<any, EncounterLibraryViewModel>;
}
