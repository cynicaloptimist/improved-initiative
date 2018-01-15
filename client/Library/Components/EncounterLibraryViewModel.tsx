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
    filter: string;
}


interface LibraryFilterProps {
    applyFilterFn: (filter: string) => void;
}

export class LibraryFilter extends React.Component<LibraryFilterProps> {
    public render() {
        const applyFilter: React.KeyboardEventHandler<HTMLInputElement> = (event: React.KeyboardEvent<HTMLInputElement>) => {
            this.props.applyFilterFn(event.currentTarget.value);
        };
        
        return <input className="filter-library" placeholder="Filter..." onKeyUp={applyFilter} />;
    }
}

export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            filter: ""
        };
    }
    public render() {
        const filteredListings = this.props.library.Encounters();

        const loadSavedEncounter = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            listing.GetAsync(savedEncounter => this.props.tracker.Encounter.LoadSavedEncounter(savedEncounter));
        };

        const deleteListing = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            if (confirm(`Delete saved encounter "${listing.CurrentName()}"?`)) {
                this.props.library.Delete(listing);
            }
        };

        return ([
            <LibraryFilter applyFilterFn={filter => this.setState({ filter })}/>,
            <ul className="listings">
                {filteredListings.map(l => <ListingViewModel name={l.CurrentName()} onAdd={loadSavedEncounter} onDelete={deleteListing} listing={l} />)}
            </ul>
        ]);
    }
}
