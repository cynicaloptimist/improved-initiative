import * as React from "react";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Overlay } from "../../Components/Overlay";
import { StatBlockComponent } from "../../Components/StatBlock";
import { StatBlock } from "../../StatBlock/StatBlock";
import { StatBlockTextEnricher } from "../../StatBlock/StatBlockTextEnricher";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { NPCLibrary } from "../NPCLibrary";
import { PCLibrary } from "../PCLibrary";
import { BuildListingTree } from "./BuildListingTree";
import { LibraryFilter } from "./LibraryFilter";
import { ListingViewModel } from "./Listing";
import { ListingButton } from "./ListingButton";

export type StatBlockLibraryViewModelProps = {
    librariesCommander: LibrariesCommander;
    library: PCLibrary | NPCLibrary;
    statBlockTextEnricher: StatBlockTextEnricher;
};

type StatBlockListing = Listing<StatBlock>;

interface State {
    filter: string;
    previewedStatBlock: StatBlock;
    previewIconHovered: boolean;
    previewWindowHovered: boolean;
    previewPosition: { left: number; top: number; };
}

export class StatBlockLibraryViewModel extends React.Component<StatBlockLibraryViewModelProps, State> {
    constructor(props: StatBlockLibraryViewModelProps) {
        super(props);
        this.state = {
            filter: "",
            previewedStatBlock: StatBlock.Default(),
            previewIconHovered: false,
            previewWindowHovered: false,
            previewPosition: { left: 0, top: 0 }
        };

        this.filterCache = new FilterCache(this.props.library.StatBlocks());
    }

    public componentDidMount() {
        this.librarySubscription = this.props.library.StatBlocks.subscribe(newStatBlocks => {
            this.filterCache = new FilterCache(newStatBlocks);
            this.forceUpdate();
        });
    }

    public componentWillUnmount() {
        this.librarySubscription.dispose();
    }

    private filterCache: FilterCache<StatBlockListing>;
    private librarySubscription: KnockoutSubscription;

    private loadSavedStatBlock = (listing: StatBlockListing, hideOnAdd: boolean) => {
        this.props.librariesCommander.AddStatBlockFromListing(listing, hideOnAdd);
    }

    private editStatBlock = (l: Listing<StatBlock>) => {
        l.CurrentName.subscribe(_ => this.forceUpdate());
        this.props.librariesCommander.EditStatBlock(l, this.props.library.StoreName, this.props.library.SaveEditedStatBlock);
    }

    private previewStatblock = (l: Listing<StatBlock>, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const previewPosition = {
            left: rect.left + rect.width,
            top: rect.top
        };

        const statBlockOutline: StatBlock = {
            ...StatBlock.Default(),
            Name: l.CurrentName(),
        };

        this.setState({
            previewedStatBlock: statBlockOutline,
            previewIconHovered: true,
            previewPosition,
        });

        l.GetAsyncWithUpdatedId(partialStatBlock => {
            const statBlock = {
                ...StatBlock.Default(),
                ...partialStatBlock,
            };

            this.setState({
                previewedStatBlock: statBlock,
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

    private buildListingComponent = (l: Listing<StatBlock>) => <ListingViewModel
        key={l.Id}
        name={l.CurrentName()}
        onAdd={this.loadSavedStatBlock}
        onEdit={this.editStatBlock}
        onPreview={this.previewStatblock}
        onPreviewOut={this.onPreviewOut}
        listing={l} />

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
                <ListingButton buttonClass="hide" faClass="chevron-up" onClick={() => this.props.librariesCommander.HideLibraries()} />
                <ListingButton buttonClass="new" faClass="plus" onClick={() => this.props.librariesCommander.CreateAndEditStatBlock(this.props.library.StoreName)} />
            </div>
            {previewVisible &&
                <Overlay
                    handleMouseEvents={this.handlePreviewMouseEvent}
                    maxHeightPx={300}
                    left={this.state.previewPosition.left}
                    top={this.state.previewPosition.top}>
                    <StatBlockComponent
                        statBlock={this.state.previewedStatBlock}
                        enricher={this.props.statBlockTextEnricher}
                        displayMode="default" />
                </Overlay>
            }
        </div>);
    }
}
