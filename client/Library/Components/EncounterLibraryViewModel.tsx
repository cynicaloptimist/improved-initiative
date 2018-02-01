import * as React from "react";
import { SavedCombatant, SavedEncounter } from "../../Encounter/SavedEncounter";
import { TrackerViewModel } from "../../TrackerViewModel";
import { EncounterLibrary } from "../EncounterLibrary";
import { DedupeByRankAndFilterListings, Listing } from "../Listing";
import { LibraryFilter } from "./LibraryFilter";
import { ListingViewModel } from "./Listing";
import { ListingButton } from "./ListingButton";

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
            <div className="buttons">
                <ListingButton faClass="chevron-up" onClick={() => this.props.tracker.LibrariesVisible(false)} />
                <ListingButton faClass="plus" onClick={() => this.props.tracker.EncounterCommander.SaveEncounter()} />
            </div>
        </React.Fragment>);
    }
}
