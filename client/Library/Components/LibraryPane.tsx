import { LineClampProperty } from "csstype";
import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { Overlay } from "../../Components/Overlay";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { BuildListingTree, ListingGroupFn } from "./BuildListingTree";
import { LibraryFilter } from "./LibraryFilter";

interface LibraryPaneProps<T extends Listable> {
  listings: Listing<T>[];
  defaultItem: T;
  renderListingRow: (
    listing: Listing<T>,
    onPreview: (
      listing: Listing<T>,
      e: React.MouseEvent<HTMLDivElement>
    ) => void,
    onPreviewOut: () => void
  ) => JSX.Element;
  groupByFunctions: ListingGroupFn[];
  addNewItem: () => void;
  renderPreview: (item: T) => JSX.Element;
}

interface State<T extends Listable> {
  filter: string;
  groupingFunctionIndex: number;
  previewedItem: T;
  previewIconHovered: boolean;
  previewWindowHovered: boolean;
  previewPosition: { left: number; top: number };
}

export class LibraryPane<T extends Listable & object> extends React.Component<
  LibraryPaneProps<T>,
  State<T>
> {
  private filterCache: FilterCache<Listing<T>>;

  constructor(props: LibraryPaneProps<T>) {
    super(props);
    this.state = {
      filter: "",
      groupingFunctionIndex: 0,
      previewedItem: props.defaultItem,
      previewIconHovered: false,
      previewWindowHovered: false,
      previewPosition: { left: 0, top: 0 }
    };

    this.filterCache = new FilterCache(props.listings);
  }

  public render() {
    this.filterCache.UpdateIfItemsChanged(this.props.listings);

    const filteredListings = this.filterCache.GetFilteredEntries(
      this.state.filter
    );
    const listingAndFolderComponents = BuildListingTree(
      l => this.props.renderListingRow(l, this.previewItem, this.onPreviewOut),
      this.props.groupByFunctions[this.state.groupingFunctionIndex],
      filteredListings
    );

    const previewVisible =
      this.state.previewIconHovered || this.state.previewWindowHovered;

    return (
      <div className="library">
        <div className="search-controls">
          <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
          {this.props.groupByFunctions.length > 1 && (
            <Button
              additionalClassNames="group-by"
              fontAwesomeIcon="sort"
              onClick={this.toggleGroupBy}
            />
          )}
        </div>
        <ul className="listings">{listingAndFolderComponents}</ul>
        <div className="buttons">
          <Button
            text="Add New"
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
            {this.props.renderPreview(this.state.previewedItem)}
          </Overlay>
        )}
      </div>
    );
  }

  private toggleGroupBy = () =>
    this.setState(state => {
      return {
        groupingFunctionIndex:
          (state.groupingFunctionIndex + 1) % this.props.groupByFunctions.length
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

    const isSingleColumnLayout = window.matchMedia("(max-width: 650px)")
      .matches;
    if (isSingleColumnLayout) {
      previewPosition = {
        left: 0,
        top: 150
      };
    }

    const outline: T = {
      ...this.props.defaultItem,
      Name: l.Listing().Name
    };

    this.setState({
      previewedItem: outline,
      previewIconHovered: true,
      previewPosition
    });

    l.GetAsyncWithUpdatedId(partialItem => {
      const item = {
        ...this.props.defaultItem,
        ...partialItem
      };

      this.setState({
        previewedItem: item
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
}
