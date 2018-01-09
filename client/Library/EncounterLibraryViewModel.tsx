import { Listing, DedupeByRankAndFilterListings } from "./Listing";
import { SavedEncounter, SavedCombatant } from "../Encounter/SavedEncounter";
import { TrackerViewModel } from "../TrackerViewModel";
import { EncounterLibrary } from "./EncounterLibrary";
import { KeyValueSet } from "../Utility/Toolbox";
import * as React from "react";

export type EncounterLibraryViewModelProps = { library: EncounterLibrary };
export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps> {
    public render() {
        const listings = this.props.library.Encounters();
        return (
            <ul>
                {listings.map(l => <li>{l.CurrentName()}</li>)}
            </ul>
        );
    }
}
