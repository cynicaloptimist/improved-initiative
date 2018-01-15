import * as React from "react";
import { ListingViewModel } from "./Listing";
import { EncounterLibrary } from "../EncounterLibrary";
import { SavedEncounter, SavedCombatant } from "../../Encounter/SavedEncounter";
import { Listing, DedupeByRankAndFilterListings } from "../Listing";
import { TrackerViewModel } from "../../TrackerViewModel";
import { LibraryFilter } from "./LibraryFilter";
import { Button } from "./Button";

export type EncounterLibraryViewModelProps = {
    tracker: TrackerViewModel;
    library: EncounterLibrary
};

interface State {
    filter: string;
}

export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            filter: ""
        };
    }
    public render() {
        const filteredListings = DedupeByRankAndFilterListings(this.props.library.Encounters(), this.state.filter);

        const loadSavedEncounter = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            listing.GetAsync(savedEncounter => this.props.tracker.Encounter.LoadSavedEncounter(savedEncounter));
        };

        const deleteListing = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            if (confirm(`Delete saved encounter "${listing.CurrentName()}"?`)) {
                this.props.library.Delete(listing);
            }
        };

        return (<React.Fragment>
            <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
            <ul className="listings">
                {filteredListings.map(l => <ListingViewModel key={l.Id} name={l.CurrentName()} onAdd={loadSavedEncounter} onDelete={deleteListing} listing={l} />)}
            </ul>
            <Button faClass="chevron-up" onClick={() => this.props.tracker.LibrariesVisible(false)}/>
        </React.Fragment>);
    }
}
