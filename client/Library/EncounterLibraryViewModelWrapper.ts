import { Listing, DedupeByRankAndFilterListings } from "./Listing";
import { SavedEncounter, SavedCombatant } from "../Encounter/SavedEncounter";
import { TrackerViewModel } from "../TrackerViewModel";
import { EncounterLibrary } from "./EncounterLibrary";
import { KeyValueSet } from "../Utility/Toolbox";
import { EncounterLibraryViewModel } from "./EncounterLibraryViewModel";

type EncounterListing = Listing<SavedEncounter<SavedCombatant>>;

export class EncounterLibraryViewModelWrapper {
    constructor() {
        
    }

    public EncounterLibraryViewModel = EncounterLibraryViewModel;
}
