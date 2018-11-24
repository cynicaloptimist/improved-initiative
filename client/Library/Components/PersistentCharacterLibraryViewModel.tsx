import * as React from "react";

import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { PersistentCharacterLibrary } from "../PersistentCharacterLibrary";
import { BuildListingTree } from "./BuildListingTree";
import { LibraryFilter } from "./LibraryFilter";
import { ListingViewModel } from "./Listing";

export type PersistentCharacterLibraryViewModelProps = {
    librariesCommander: LibrariesCommander;
    library: PersistentCharacterLibrary;
    statBlockTextEnricher: TextEnricher;
};

interface State {
    filter: string;
}

export class PersistentCharacterLibraryViewModel extends React.Component<PersistentCharacterLibraryViewModelProps, State> {
    constructor(props: PersistentCharacterLibraryViewModelProps) {
        super(props);
        this.state = {
            filter: "",
        };

        this.filterCache = new FilterCache(this.props.library.GetListings());
    }

    public componentDidMount() {
        this.librarySubscription = this.props.library.GetListings
            .subscribe(newListings => {
                this.filterCache = new FilterCache(newListings);
                this.forceUpdate();
            });
    }

    public componentWillUnmount() {
        this.librarySubscription.dispose();
    }

    private filterCache: FilterCache<Listing<PersistentCharacter>>;
    private librarySubscription: KnockoutSubscription;

    private loadSavedStatBlock = (listing: Listing<PersistentCharacter>, hideOnAdd: boolean) => {
        this.props.librariesCommander.AddPersistentCharacterFromListing(listing, hideOnAdd);
    }

    private editStatBlock = (l: Listing<PersistentCharacter>) => {
        const subscription = l.CurrentName.subscribe(() => {
            this.filterCache = new FilterCache(this.props.library.GetListings());
            this.forceUpdate(() => subscription.dispose());
        });
        this.props.librariesCommander.EditPersistentCharacterStatBlock(l.Id);
    }

    private buildListingComponent = (l: Listing<PersistentCharacter>) => <ListingViewModel
        key={l.Id}
        name={l.CurrentName()}
        onAdd={this.loadSavedStatBlock}
        onEdit={this.editStatBlock}
        listing={l} />

    public render() {
        const filteredListings = this.filterCache.GetFilteredEntries(this.state.filter);
        const listingAndFolderComponents = BuildListingTree(this.buildListingComponent, filteredListings);

        return (<div className="library">
            <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
            <ul className="listings">
                {listingAndFolderComponents}
            </ul>
            <div className="buttons">
                <Button additionalClassNames="hide" fontAwesomeIcon="chevron-up" onClick={() => this.props.librariesCommander.HideLibraries()} />
                <Button additionalClassNames="new" fontAwesomeIcon="plus" onClick={() => this.props.librariesCommander.CreateAndEditPersistentCharacterStatBlock()} />
            </div>
        </div>);
    }
}
