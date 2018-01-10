import * as React from "react";
import { ListingViewModel } from "./Listing";
import { EncounterLibrary } from "../EncounterLibrary";
import { SavedEncounter, SavedCombatant } from "../../Encounter/SavedEncounter";
import { Listing } from "../Listing";
import { TrackerViewModel } from "../../TrackerViewModel";

export type EncounterLibraryViewModelProps = {
    tracker: TrackerViewModel;
    library: EncounterLibrary
};
export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps> {
    public render() {
        const listings = this.props.library.Encounters();

        const add = (savedEncounter: SavedEncounter<SavedCombatant>) => {
            this.props.tracker.Encounter.LoadSavedEncounter(savedEncounter);
        };

        return (
            <ul>
                {listings.map(l => <ListingViewModel name={l.CurrentName()} onAdd={add} listing={l} />)}
            </ul>
        );
    }
}
