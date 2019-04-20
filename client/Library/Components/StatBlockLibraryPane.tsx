import _ = require("lodash");
import * as React from "react";
import { StatBlock } from "../../../common/StatBlock";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
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

    linkComponentToObservables(this);
  }

  public render() {
    const listings = this.props.library.GetStatBlocks();

    return (
      <LibraryPane
        defaultItem={StatBlock.Default()}
        listings={listings}
        renderListingRow={this.renderListingRow}
        groupByFunctions={this.groupingFunctions}
        hideLibraries={this.props.librariesCommander.HideLibraries}
        addNewItem={() =>
          this.props.librariesCommander.CreateAndEditStatBlock(
            this.props.library
          )
        }
        renderPreview={statBlock => (
          <StatBlockComponent
            statBlock={statBlock}
            enricher={this.props.statBlockTextEnricher}
            displayMode="default"
          />
        )}
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

  private renderListingRow = (
    l: Listing<StatBlock>,
    onPreview,
    onPreviewOut
  ) => (
    <ListingRow
      key={l.Listing().Id + l.Listing().Path + l.Listing().Name}
      name={l.Listing().Name}
      showCount
      onAdd={this.loadSavedStatBlock}
      onEdit={this.editStatBlock}
      onPreview={onPreview}
      onPreviewOut={onPreviewOut}
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
}

function GetAlphaSortableLevelString(level: string) {
  if (level == "0") return "0001";
  if (level == "1/8") return "0002";
  if (level == "1/4") return "0003";
  if (level == "1/2") return "0004";
  if (parseInt(level) == NaN) return "0000" + level;
  return _.padStart(level + "0", 4, "0");
}
