import * as React from "react";
import { StatBlock } from "../../../common/StatBlock";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { Overlay } from "../../Components/Overlay";
import { StatBlockComponent } from "../../Components/StatBlock";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { StatBlockLibrary } from "../StatBlockLibrary";
import { BuildListingTree, ListingGroupFn } from "./BuildListingTree";
import { LibraryFilter } from "./LibraryFilter";
import { ListingViewModel } from "./Listing";

export type StatBlockLibraryPaneProps = {
  librariesCommander: LibrariesCommander;
  library: StatBlockLibrary;
  statBlockTextEnricher: TextEnricher;
};

type StatBlockListing = Listing<StatBlock>;

interface State {
  filter: string;
  groupBy: ListingGroupFn;
  previewedStatBlock: StatBlock;
  previewIconHovered: boolean;
  previewWindowHovered: boolean;
  previewPosition: { left: number; top: number };
}

export class StatBlockLibraryPane extends React.Component<
  StatBlockLibraryPaneProps,
  State
> {
  private filterCache: FilterCache<StatBlockListing>;
  private librarySubscription: KnockoutSubscription;

  constructor(props: StatBlockLibraryPaneProps) {
    super(props);
    this.state = {
      filter: "",
      groupBy: this.groupByPath,
      previewedStatBlock: StatBlock.Default(),
      previewIconHovered: false,
      previewWindowHovered: false,
      previewPosition: { left: 0, top: 0 }
    };

    this.filterCache = new FilterCache(this.props.library.GetStatBlocks());
  }

  public componentDidMount() {
    this.librarySubscription = this.props.library.GetStatBlocks.subscribe(
      newStatBlocks => {
        this.filterCache = new FilterCache(newStatBlocks);
        this.forceUpdate();
      }
    );
  }

  public componentWillUnmount() {
    this.librarySubscription.dispose();
  }

  public render() {
    const filteredListings = this.filterCache.GetFilteredEntries(
      this.state.filter
    );
    const listingAndFolderComponents = BuildListingTree(
      this.buildListingComponent,
      this.state.groupBy,
      filteredListings
    );

    const previewVisible =
      this.state.previewIconHovered || this.state.previewWindowHovered;

    return (
      <div className="library">
        <div className="search-controls">
          <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
          <Button
            additionalClassNames="group-by"
            fontAwesomeIcon="sort"
            onClick={this.toggleGroupBy}
          />
        </div>
        <ul className="listings">{listingAndFolderComponents}</ul>
        <div className="buttons">
          <Button
            additionalClassNames="hide"
            fontAwesomeIcon="chevron-up"
            onClick={() => this.props.librariesCommander.HideLibraries()}
          />
          <Button
            additionalClassNames="new"
            fontAwesomeIcon="plus"
            onClick={() =>
              this.props.librariesCommander.CreateAndEditStatBlock(
                this.props.library
              )
            }
          />
        </div>
        {previewVisible && (
          <Overlay
            handleMouseEvents={this.handlePreviewMouseEvent}
            maxHeightPx={300}
            left={this.state.previewPosition.left}
            top={this.state.previewPosition.top}
          >
            <StatBlockComponent
              statBlock={this.state.previewedStatBlock}
              enricher={this.props.statBlockTextEnricher}
              displayMode="default"
            />
          </Overlay>
        )}
      </div>
    );
  }

  private groupByPath: ListingGroupFn = l => l.CurrentPath();
  private groupByLevel: ListingGroupFn = l => "Challenge " + l.Metadata.Level;

  private toggleGroupBy = () =>
    this.setState(state => {
      if (state.groupBy == this.groupByPath) {
        return {
          groupBy: this.groupByLevel
        };
      }
      return {
        groupBy: this.groupByPath
      };
    });

  private buildListingComponent = (l: Listing<StatBlock>) => (
    <ListingViewModel
      key={l.Id + l.CurrentPath() + l.CurrentName()}
      name={l.CurrentName()}
      showCount
      onAdd={this.loadSavedStatBlock}
      onEdit={this.editStatBlock}
      onPreview={this.previewStatblock}
      onPreviewOut={this.onPreviewOut}
      listing={l}
    />
  );

  private loadSavedStatBlock = (
    listing: StatBlockListing,
    hideOnAdd: boolean
  ) => {
    return this.props.librariesCommander.AddStatBlockFromListing(
      listing,
      hideOnAdd
    );
  };

  private editStatBlock = (l: Listing<StatBlock>) => {
    l.CurrentName.subscribe(_ => this.forceUpdate());
    this.props.librariesCommander.EditStatBlock(l, this.props.library);
  };

  private previewStatblock = (
    l: Listing<StatBlock>,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    let previewPosition = {
      left: e.pageX,
      top: e.pageY
    };

    const isSingleColumnLayout = window.matchMedia("(max-width: 650px)")
      .matches;
    if (isSingleColumnLayout) {
      previewPosition = {
        left: 0,
        top: 150
      };
    }

    const statBlockOutline: StatBlock = {
      ...StatBlock.Default(),
      Name: l.CurrentName()
    };

    this.setState({
      previewedStatBlock: statBlockOutline,
      previewIconHovered: true,
      previewPosition
    });

    l.GetAsyncWithUpdatedId(partialStatBlock => {
      const statBlock = {
        ...StatBlock.Default(),
        ...partialStatBlock
      };

      this.setState({
        previewedStatBlock: statBlock
      });
    });
  };

  private onPreviewOut = l => {
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
