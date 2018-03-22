import _ = require("lodash");
import * as React from "react";
import { EncounterCommander } from "../../Commands/EncounterCommander";
import { Overlay } from "../../Components/Overlay";
import { SavedCombatant, SavedEncounter } from "../../Encounter/SavedEncounter";
import { UpdateLegacySavedEncounter } from "../../Encounter/UpdateLegacySavedEncounter";
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
    previewedEncounterCombatants: { key: string, name: string } [];
    previewIconHovered: boolean;
    previewWindowHovered: boolean;
    previewPosition: { left: number; top: number; };
}

export class EncounterLibraryViewModel extends React.Component<EncounterLibraryViewModelProps, State> {
    constructor(props: EncounterLibraryViewModelProps) {
        super(props);
        this.state = {
            filter: "",
            previewedEncounterCombatants: [],
            previewIconHovered: false,
            previewWindowHovered: false,
            previewPosition: null,
        };

        this.filterCache = new FilterCache(this.props.library.Encounters());
    }

    private librarySubscription: KnockoutSubscription;
    private filterCache: FilterCache<EncounterListing>;

    public componentDidMount() {
        this.librarySubscription = this.props.library.Encounters.subscribe(newEncounters => {
            this.filterCache = new FilterCache(newEncounters);
            this.forceUpdate();
        });
    }

    public componentWillUnmount() {
        this.librarySubscription.dispose();
    }

    private previewSavedEncounter = (l: EncounterListing, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const previewPosition = {
            left: rect.left + rect.width,
            top: rect.top
        };

        this.setState({
            previewedEncounterCombatants: [{ key: "encounter", name: l.CurrentName() }],
            previewIconHovered: true,
            previewPosition,
        });

        l.GetAsync(legacyEncounter => {
            const encounter = UpdateLegacySavedEncounter(legacyEncounter);
            const previewedEncounterCombatants = encounter.Combatants.map(c => ({ key: c.Id, name: c.StatBlock.Name }));
            this.setState({
                previewedEncounterCombatants
            });
        });
    }

    private onPreviewOut = (l => {
        this.setState({ previewIconHovered: false });
    });

    private handlePreviewMouseEvent = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.type === "mouseenter") {
            this.setState({ previewWindowHovered: true });
        }
        if (e.type === "mouseleave") {
            this.setState({ previewWindowHovered: false });
        }
    }

    private loadSavedEncounter = (listing: EncounterListing) => {
        listing.GetAsync(savedEncounter => this.props.encounterCommander.LoadEncounter(savedEncounter));
    }

    private deleteListing = (listing: EncounterListing) => {
        if (confirm(`Delete saved encounter "${listing.CurrentName()}"?`)) {
            this.props.library.Delete(listing);
        }
    }

    private buildTree = (listings: EncounterListing[]): JSX.Element[] => {
        const components = [];
        listings.forEach(listing => {
            if (listing.Path == "") {
                const component = <ListingViewModel
            key={listing.Id}
            name={listing.CurrentName()}
            onAdd={this.loadSavedEncounter}
            onDelete={this.deleteListing}
            onPreview={this.previewSavedEncounter}
            onPreviewOut={this.onPreviewOut}
            listing={listing} />;
        
                components.push(component);
            } else {
        }
        });

        return components;
    }

    public render() {
        const filteredListings = this.filterCache.GetFilteredEntries(this.state.filter);
        const listingAndFolderComponents = this.buildTree(filteredListings);

        const previewVisible = this.state.previewIconHovered || this.state.previewWindowHovered;

        return (<div className="library">
            <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
            <ul className="listings">
                {listingAndFolderComponents}
            </ul>
            <div className="buttons">
                <ListingButton buttonClass="chevron-up" onClick={() => this.props.encounterCommander.HideLibraries()} />
                <ListingButton buttonClass="plus" onClick={() => this.props.encounterCommander.SaveEncounter()} />
            </div>
            {previewVisible &&
                <Overlay
                handleMouseEvents={this.handlePreviewMouseEvent}
                maxHeightPx={300}
                left={this.state.previewPosition.left}
                top={this.state.previewPosition.top}>
                <ul className="c-encounter-preview">{this.state.previewedEncounterCombatants.map(c => <li key={c.key}>{c.name}</li>)}</ul>
                </Overlay>
            }
        </div>);
    }
}
