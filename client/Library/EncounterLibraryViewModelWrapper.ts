import { Listing, DedupeByRankAndFilterListings } from "./Listing";
import { SavedEncounter, SavedCombatant } from "../Encounter/SavedEncounter";
import { TrackerViewModel } from "../TrackerViewModel";
import { EncounterLibrary } from "./EncounterLibrary";
import { KeyValueSet } from "../Utility/Toolbox";
import { EncounterLibraryViewModel, EncounterLibraryViewModelProps } from "./Components/EncounterLibraryViewModel";
import { StatBlockLibrary } from "./StatBlockLibraryViewModel";
import { Encounter } from "../Encounter/Encounter";
import * as React from "react";

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
