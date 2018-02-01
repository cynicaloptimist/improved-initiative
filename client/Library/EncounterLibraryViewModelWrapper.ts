import * as React from "react";
import { Encounter } from "../Encounter/Encounter";
import { SavedCombatant, SavedEncounter } from "../Encounter/SavedEncounter";
import { TrackerViewModel } from "../TrackerViewModel";
import { KeyValueSet } from "../Utility/Toolbox";
import { EncounterLibraryViewModel, EncounterLibraryViewModelProps } from "./Components/EncounterLibraryViewModel";
import { EncounterLibrary } from "./EncounterLibrary";
import { DedupeByRankAndFilterListings, Listing } from "./Listing";
import { StatBlockLibrary } from "./StatBlockLibraryViewModel";

type EncounterListing = Listing<SavedEncounter<SavedCombatant>>;

export class EncounterLibraryViewModelWrapper {
    constructor(tracker: TrackerViewModel, library: EncounterLibrary) {
        const props = {
            library,
            tracker
        };
        this.component = React.createElement(EncounterLibraryViewModel, props);
    }
    private component: React.ComponentElement<any, EncounterLibraryViewModel>;
}
