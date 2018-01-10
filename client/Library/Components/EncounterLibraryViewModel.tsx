import * as React from "react";
import { ListingViewModel } from "./Listing";
import { EncounterLibrary } from "../EncounterLibrary";
import { Encounter } from "../../Encounter/Encounter";
import { SavedEncounter, SavedCombatant } from "../../Encounter/SavedEncounter";
import { Listing } from "../Listing";

export type EncounterLibraryViewModelProps = {
    encounter: Encounter;
    library: EncounterLibrary
};
export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps> {
    private add(savedEncounter: SavedEncounter<SavedCombatant>) {
        this.props.encounter.LoadSavedEncounter(savedEncounter);
    }
    
    public render() {
        const listings = this.props.library.Encounters();

        
        return (
            <ul>
                {listings.map(l => <ListingViewModel name={l.CurrentName()} onAdd={this.add} listing={l} />)}
            </ul>
        );
    }
}
