import { Listing, DedupeByRankAndFilterListings } from "./Listing";
import { SavedEncounter, SavedCombatant } from "../Encounter/SavedEncounter";
import { TrackerViewModel } from "../TrackerViewModel";
import { EncounterLibrary } from "./EncounterLibrary";
import { KeyValueSet } from "../Utility/Toolbox";
import * as React from "react";

type EncounterListing = Listing<SavedEncounter<SavedCombatant>>;

export class EncounterLibraryViewModel extends React.Component {
    public render() {
        return <p>Hello World!</p>;
    }
}
