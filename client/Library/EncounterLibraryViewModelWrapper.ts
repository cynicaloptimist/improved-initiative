import { Listing, DedupeByRankAndFilterListings } from "./Listing";
import { SavedEncounter, SavedCombatant } from "../Encounter/SavedEncounter";
import { TrackerViewModel } from "../TrackerViewModel";
import { EncounterLibrary } from "./EncounterLibrary";
import { KeyValueSet } from "../Utility/Toolbox";
import { EncounterLibraryViewModel, EncounterLibraryViewModelProps } from "./EncounterLibraryViewModel";
import { EncounterCommander } from "../Commands/EncounterCommander";
import { StatBlockLibrary } from "./StatBlockLibraryViewModel";

type EncounterListing = Listing<SavedEncounter<SavedCombatant>>;

export class EncounterLibraryViewModelWrapper {
    constructor(encounterCommander: EncounterCommander, library: EncounterLibrary) {
        this.props = {
            library
        };
     }
    private encounterLibraryViewModel = EncounterLibraryViewModel;
    private props: EncounterLibraryViewModelProps;
}
