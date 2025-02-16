import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { Overlay } from "../../Components/Overlay";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { BuildListingTree, ListingGroup } from "../Components/BuildListingTree";
import { LibraryFilter } from "../Components/LibraryFilter";
import { ListingButton } from "../Components/ListingButton";
import { CurrentSettings } from "../../Settings/Settings";

interface LibraryReferencePaneProps<T extends Listable> {
  listings: Listing<T>[];
  defaultItem: T;
  renderListingRow: (
    listing: Listing<T>,
    onPreview: (
      listing: Listing<T>,
      e: React.MouseEvent<HTMLDivElement>
    ) => void,
    onPreviewOut: () => void,
    showSource?: boolean
  ) => JSX.Element;
  listingGroups: ListingGroup[];
  addNewText?: string;
  addNewItem: () => void;
  renderPreview: (item: T, isLoading: boolean) => JSX.Element;
  showPreloadInfo?: boolean;
  showSortControl?: boolean;
  launchQuickAddPrompt?: () => void;
}

interface State<T extends Listable> {
  filter: string;
  countOfItemsToRender: number;
  listingGroupIndex: number;
  sortMethod: "alphabetical" | "recent";
  previewedItem: T;
  previewLoading: boolean;
  previewIconHovered: boolean;
  previewWindowHovered: boolean;
  previewPosition: { left: number; top: number };
}

export class LibraryReferencePane<T extends Listable> extends React.Component<
  LibraryReferencePaneProps<T>,
  State<T>
> {
  private filterCache: FilterCache<Listing<T>>;

  constructor(props: LibraryReferencePaneProps<T>) {
    super(props);
    this.state = {
      filter: "",
      countOfItemsToRender: 100,
      listingGroupIndex: 0,
      sortMethod: "alphabetical",
      previewedItem: props.defaultItem,
      previewLoading: false,
      previewIconHovered: false,
      previewWindowHovered: false,
      previewPosition: { left: 0, top: 0 }
    };

    this.filterCache = new FilterCache(props.listings);
  }

  public render(): JSX.Element {
    this.filterCache.UpdateIfItemsChanged(this.props.listings);

    let filteredListings = this.filterCache.GetFilteredEntries(
      this.state.filter
    );

    if (this.state.sortMethod === "recent") {
      const recentItemIds = CurrentSettings().RecentItemIds;
      filteredListings = this.getRecentItems(filteredListings, recentItemIds);
    }

    const grouping = this.props.listingGroups[this.state.listingGroupIndex];

    const listingAndFolderComponents = BuildListingTree(
      (listing, index, array) => {
        // If an adjacent listing has the same name, show the source
        let showSource = false;
        if (
          array[index - 1]?.Meta().Name === listing.Meta().Name ||
          array[index + 1]?.Meta().Name === listing.Meta().Name
        ) {
          showSource = true;
        }
        return this.props.renderListingRow(
          listing,
          this.previewItem,
          this.onPreviewOut,
          showSource
        );
      },
      grouping,
      filteredListings
    );

    const previewVisible =
      this.state.previewIconHovered || this.state.previewWindowHovered;

    return (
      <div className="library">
        <div className="search-controls">
          <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
          {this.props.showSortControl && (
            <Button
              tooltip={`Sorted by ${
                this.state.sortMethod === "alphabetical"
                  ? "name"
                  : "recently used"
              }`}
              tooltipProps={{ hideOnClick: false }}
              fontAwesomeIcon={
                this.state.sortMethod === "alphabetical"
                  ? "sort-alpha-down"
                  : "clock"
              }
              onClick={() => {
                if (this.state.sortMethod === "alphabetical") {
                  this.setState({
                    sortMethod: "recent"
                  });
                } else {
                  this.setState({
                    sortMethod: "alphabetical"
                  });
                }
              }}
            />
          )}
          {this.props.listingGroups.length > 1 && (
            <Button
              tooltip={`Grouped by ${grouping.label}`}
              tooltipProps={{ hideOnClick: false }}
              fontAwesomeIcon="folder"
              onClick={this.toggleGroupBy}
            />
          )}
        </div>
        <ul
          className="listings zebra-stripe"
          onScroll={this.handleListingsScroll}
        >
          {listingAndFolderComponents.slice(0, this.state.countOfItemsToRender)}
          {this.props.showPreloadInfo && (
            <li style={{ margin: 5, fontStyle: "italic" }}>
              <p style={{ flexShrink: 1 }}>
                Improved Initiative comes pre-loaded with statblocks from the{" "}
                <a href="https://open5e.com/" target="_blank">
                  Open5e API
                </a>
                . Visit the Content tab on the Settings pane to configure
                preloaded content.
              </p>
            </li>
          )}
          {this.props.launchQuickAddPrompt && (
            <li>
              <ListingButton
                buttonClass="add"
                text={"Quick Add a Combatant without a Statblock"}
                faClass="bolt"
                onClick={this.props.launchQuickAddPrompt}
              />
            </li>
          )}
        </ul>
        <div className="buttons">
          <Button
            text={this.props.addNewText || "Add New"}
            additionalClassNames="new"
            fontAwesomeIcon="plus"
            onClick={this.props.addNewItem}
          />
        </div>
        {previewVisible && (
          <Overlay
            handleMouseEvents={this.handlePreviewMouseEvent}
            maxHeightPx={300}
            left={this.state.previewPosition.left}
            top={this.state.previewPosition.top}
          >
            {this.props.renderPreview(
              this.state.previewedItem,
              this.state.previewLoading
            )}
          </Overlay>
        )}
      </div>
    );
  }

  private getRecentItems(
    listings: Listing<any>[],
    recentIds: string[]
  ): Listing<any>[] {
    const recentListingsById = new Map<string, Listing<any>>();

    for (const listing of listings) {
      const listingId = listing.Meta().Id;
      if (recentIds.includes(listingId)) {
        recentListingsById.set(listingId, listing);
      }
    }

    const recentListings: Listing<any>[] = [];
    for (const id of recentIds) {
      const listing = recentListingsById.get(id);
      if (listing) {
        recentListings.push(listing);
      }
    }

    return recentListings;
  }

  private toggleGroupBy = () =>
    this.setState(state => {
      return {
        listingGroupIndex:
          (state.listingGroupIndex + 1) % this.props.listingGroups.length
      };
    });

  private previewItem = (
    l: Listing<T>,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    let previewPosition = {
      left: e.pageX - 10,
      top: e.pageY - 10
    };

    const isSingleColumnLayout =
      window.matchMedia("(max-width: 650px)").matches;
    if (isSingleColumnLayout) {
      previewPosition = {
        left: 0,
        top: 150
      };
    }

    const outline: T = {
      ...this.props.defaultItem,
      Name: l.Meta().Name,
      Source: l.Meta().FilterDimensions.Source,
      Type: l.Meta().FilterDimensions.Type
    };

    this.setState({
      previewedItem: outline,
      previewIconHovered: true,
      previewLoading: true,
      previewPosition
    });

    l.GetAsyncWithUpdatedId(partialItem => {
      const item = {
        ...this.props.defaultItem,
        ...partialItem
      };

      this.setState({
        previewedItem: item,
        previewLoading: false
      });
    });
  };

  private onPreviewOut = () => {
    this.setState({ previewIconHovered: false });
  };

  private handlePreviewMouseEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.type === "mouseenter") {
      this.setState({ previewWindowHovered: true });
    }
    if (e.type === "mouseleave") {
      this.setState({ previewWindowHovered: false });
    }
  };

  private handleListingsScroll = (
    scrollEvent: React.UIEvent<HTMLUListElement>
  ) => {
    const target = scrollEvent.target as HTMLUListElement;
    const isScrolledToBottom =
      target.offsetHeight + target.scrollTop > target.scrollHeight - 10;
    if (isScrolledToBottom) {
      this.setState({
        countOfItemsToRender: this.state.countOfItemsToRender + 100
      });
    }
  };
}
