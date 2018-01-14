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

interface State {
    listings: Listing<SavedEncounter<SavedCombatant>>[];
}

export class LibraryFilter extends React.Component<{}> {

}

export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            listings: this.props.library.Encounters()
        };
    }
    public render() {
        const loadSavedEncounter = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            listing.GetAsync(savedEncounter => this.props.tracker.Encounter.LoadSavedEncounter(savedEncounter));
        };

        const deleteListing = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            if (confirm(`Delete saved encounter "${listing.CurrentName()}"?`)) {
                this.props.library.Delete(listing);
            }
        };

        return ([
            <LibraryFilter />,
            <ul className="listings">
                {this.state.listings.map(l => <ListingViewModel name={l.CurrentName()} onAdd={loadSavedEncounter} onDelete={deleteListing} listing={l} />)}
            </ul>
        ]);
    }
}
