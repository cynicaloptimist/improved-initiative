import * as React from "react";
import { EncounterCommander } from "../../Commands/EncounterCommander";
import { SavedCombatant, SavedEncounter } from "../../Encounter/SavedEncounter";
import { EncounterLibrary } from "../EncounterLibrary";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { LibraryFilter } from "./LibraryFilter";
import { ListingViewModel } from "./Listing";
import { ListingButton } from "./ListingButton";

export type EncounterLibraryViewModelProps = {
    encounterCommander: EncounterCommander;
    library: EncounterLibrary;
};

type EncounterListing = Listing<SavedEncounter<SavedCombatant>>;

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

    private filterCache: FilterCache<EncounterListing>;

    public render() {
        const filteredListings = this.filterCache.GetFilteredEntries(this.state.filter);

        const loadSavedEncounter = (listing: EncounterListing) => {
            listing.GetAsync(savedEncounter => this.props.encounterCommander.LoadEncounter(savedEncounter));
        };

        const deleteListing = (listing: EncounterListing) => {
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
                <ListingButton faClass="chevron-up" onClick={() => this.props.encounterCommander.HideLibraries()} />
                <ListingButton faClass="plus" onClick={() => this.props.encounterCommander.SaveEncounter()} />
            </div>
        </div>);
    }
}
