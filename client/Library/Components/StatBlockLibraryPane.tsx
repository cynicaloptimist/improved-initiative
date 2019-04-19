import _ = require("lodash");
import * as React from "react";
import { StatBlock } from "../../../common/StatBlock";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { StatBlockComponent } from "../../Components/StatBlock";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { StatBlockLibrary } from "../StatBlockLibrary";
import { BuildListingTree, ListingGroupFn } from "./BuildListingTree";
import { LibraryPane } from "./LibraryPane";
import { ListingRow } from "./ListingRow";

export type StatBlockLibraryPaneProps = {
  librariesCommander: LibrariesCommander;
  library: StatBlockLibrary;
  statBlockTextEnricher: TextEnricher;
};

type StatBlockListing = Listing<StatBlock>;

interface State {
  filter: string;
  groupingFunctionIndex: number;
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
      groupingFunctionIndex: 0,
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
      this.renderListingRow,
      this.groupingFunctions[this.state.groupingFunctionIndex],
      filteredListings
    );

    const previewVisible =
      this.state.previewIconHovered || this.state.previewWindowHovered;

    return (
      <LibraryPane
        listingAndFolderComponents={listingAndFolderComponents}
        applyFilter={filter => this.setState({ filter })}
        toggleGroupBy={this.toggleGroupBy}
        hideLibraries={this.props.librariesCommander.HideLibraries}
        addNewItem={() =>
          this.props.librariesCommander.CreateAndEditStatBlock(
            this.props.library
          )
        }
        handlePreviewMouseEvent={this.handlePreviewMouseEvent}
        previewPosition={this.state.previewPosition}
        previewVisible={previewVisible}
        previewComponent={
          <StatBlockComponent
            statBlock={this.state.previewedStatBlock}
            enricher={this.props.statBlockTextEnricher}
            displayMode="default"
          />
        }
      />
    );
  }

  private groupingFunctions: ListingGroupFn[] = [
    l => ({
      key: l.Listing().Path
    }),
    l => ({
      label: "Challenge " + l.Listing().Metadata.Level,
      key: GetAlphaSortableLevelString(l.Listing().Metadata.Level)
    }),
    l => ({
      key: l.Listing().Metadata.Source
    }),
    l => ({
      key: l.Listing().Metadata.Type
    })
  ];

  private toggleGroupBy = () =>
    this.setState(state => {
      return {
        groupingFunctionIndex:
          (state.groupingFunctionIndex + 1) % this.groupingFunctions.length
      };
    });

  private renderListingRow = (l: Listing<StatBlock>) => (
    <ListingRow
      key={l.Listing().Id + l.Listing().Path + l.Listing().Name}
      name={l.Listing().Name}
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
    l.Listing.subscribe(_ => this.forceUpdate());
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
      Name: l.Listing().Name
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

function GetAlphaSortableLevelString(level: string) {
  if (level == "0") return "0001";
  if (level == "1/8") return "0002";
  if (level == "1/4") return "0003";
  if (level == "1/2") return "0004";
  if (parseInt(level) == NaN) return "0000" + level;
  return _.padStart(level + "0", 4, "0");
}
