import * as React from "react";
import { SavedCombatant, SavedEncounter } from "../../Encounter/SavedEncounter";
import { TrackerViewModel } from "../../TrackerViewModel";
import { EncounterLibrary } from "../EncounterLibrary";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { LibraryFilter } from "./LibraryFilter";
import { ListingViewModel } from "./Listing";
import { ListingButton } from "./ListingButton";

export type EncounterLibraryViewModelProps = {
    tracker: TrackerViewModel;
    library: EncounterLibrary;
};

interface State {
    filter: string;
}

export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps, State> {
    constructor(props: EncounterLibraryViewModelProps) {
        super(props);
        this.state = {
            filter: "",
        };
        this.filterCache = new FilterCache(this.props.library.Encounters());

        props.library.Encounters.subscribe(newEncounters => {
            this.filterCache = new FilterCache(newEncounters);
            this.forceUpdate();
        });
    }

    private filterCache: FilterCache<Listing<SavedEncounter<SavedCombatant>>>;

    public render() {
        const filteredListings = this.filterCache.GetFilteredEntries(this.state.filter);

        const loadSavedEncounter = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            listing.GetAsync(savedEncounter => this.props.tracker.Encounter.LoadSavedEncounter(savedEncounter));
        };

        const deleteListing = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
            if (confirm(`Delete saved encounter "${listing.CurrentName()}"?`)) {
                this.props.library.Delete(listing);
            }
        };

        return (<div className="library">
            <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
            <ul className="listings">
                {filteredListings.map(l => <ListingViewModel key={l.Id} name={l.CurrentName()} onAdd={loadSavedEncounter} onDelete={deleteListing} listing={l} />)}
            </ul>
            <div className="buttons">
                <ListingButton faClass="chevron-up" onClick={() => this.props.tracker.LibrariesVisible(false)} />
                <ListingButton faClass="plus" onClick={() => this.props.tracker.EncounterCommander.SaveEncounter()} />
            </div>
        </div>);
    }
}
