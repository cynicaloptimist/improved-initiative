import * as React from "react";
import { SavedCombatant, SavedEncounter } from "../../../common/SavedEncounter";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { Overlay } from "../../Components/Overlay";
import { UpdateLegacySavedEncounter } from "../../Encounter/UpdateLegacySavedEncounter";
import { EncounterLibrary } from "../EncounterLibrary";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { BuildListingTree } from "./BuildListingTree";
import { LibraryFilter } from "./LibraryFilter";
import { ListingViewModel } from "./Listing";

export type EncounterLibraryViewModelProps = {
    librariesCommander: LibrariesCommander;
    library: EncounterLibrary;
};

type EncounterListing = Listing<SavedEncounter<SavedCombatant>>;

interface State {
    filter: string;
    previewedEncounterCombatants: { key: string, name: string }[];
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

        l.GetAsyncWithUpdatedId(legacyEncounter => {
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
        listing.GetAsyncWithUpdatedId(this.props.librariesCommander.LoadEncounter);
    }

    private deleteListing = (listing: EncounterListing) => {
        if (confirm(`Delete saved encounter "${listing.CurrentName()}"?`)) {
            this.props.library.Delete(listing);
        }
    }

    private moveListing = (listing: EncounterListing) => {
        listing.GetAsyncWithUpdatedId(savedEncounter => this.props.librariesCommander.MoveEncounter(savedEncounter));
    }

    private buildListingComponent = (listing: EncounterListing) =>
        <ListingViewModel
            key={listing.Id}
            name={listing.CurrentName()}
            onAdd={this.loadSavedEncounter}
            onDelete={this.deleteListing}
            onMove={this.moveListing}
            onPreview={this.previewSavedEncounter}
            onPreviewOut={this.onPreviewOut}
            listing={listing} />

    public render() {
        const filteredListings = this.filterCache.GetFilteredEntries(this.state.filter);
        const listingAndFolderComponents = BuildListingTree(this.buildListingComponent, filteredListings);

        const previewVisible = this.state.previewIconHovered || this.state.previewWindowHovered;

        return (<div className="library">
            <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
            <ul className="listings">
                {listingAndFolderComponents}
            </ul>
            <div className="buttons">
                <Button additionalClassNames="hide" faClass="chevron-up" onClick={() => this.props.librariesCommander.HideLibraries()} />
                <Button additionalClassNames="save" faClass="plus" onClick={() => this.props.librariesCommander.SaveEncounter()} />
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
