import * as React from "react";

import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { StatBlock } from "../../../common/StatBlock";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { Overlay } from "../../Components/Overlay";
import { StatBlockComponent } from "../../Components/StatBlock";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { PersistentCharacterLibrary } from "../PersistentCharacterLibrary";
import { BuildListingTree } from "./BuildListingTree";
import { LibraryFilter } from "./LibraryFilter";
import { ListingRow } from "./ListingRow";

export type PersistentCharacterLibraryPaneProps = {
  librariesCommander: LibrariesCommander;
  library: PersistentCharacterLibrary;
  statBlockTextEnricher: TextEnricher;
};

interface State {
  filter: string;
  previewedStatBlock: StatBlock;
  previewIconHovered: boolean;
  previewWindowHovered: boolean;
  previewPosition: { left: number; top: number };
}

export class PersistentCharacterLibraryPane extends React.Component<
  PersistentCharacterLibraryPaneProps,
  State
> {
  constructor(props: PersistentCharacterLibraryPaneProps) {
    super(props);
    this.state = {
      filter: "",
      previewedStatBlock: StatBlock.Default(),
      previewIconHovered: false,
      previewWindowHovered: false,
      previewPosition: { left: 0, top: 0 }
    };

    this.filterCache = new FilterCache(this.props.library.GetListings());
  }

  public componentDidMount() {
    this.librarySubscription = this.props.library.GetListings.subscribe(
      newListings => {
        this.filterCache = new FilterCache(newListings);
        this.forceUpdate();
      }
    );
  }

  public componentWillUnmount() {
    this.librarySubscription.dispose();
  }

  private filterCache: FilterCache<Listing<PersistentCharacter>>;
  private librarySubscription: KnockoutSubscription;

  private previewStatblock = (
    l: Listing<PersistentCharacter>,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const previewPosition = {
      left: e.pageX,
      top: e.pageY
    };

    const statBlockOutline: StatBlock = {
      ...StatBlock.Default(),
      Name: l.Listing().Name
    };

    this.setState({
      previewedStatBlock: statBlockOutline,
      previewIconHovered: true,
      previewPosition
    });

    l.GetAsyncWithUpdatedId((persistentCharacter: PersistentCharacter) => {
      const statBlock = {
        ...StatBlock.Default(),
        ...persistentCharacter.StatBlock
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

  private loadSavedStatBlock = (
    listing: Listing<PersistentCharacter>,
    hideOnAdd: boolean
  ) => {
    if (!this.props.librariesCommander.CanAddPersistentCharacter(listing)) {
      return false;
    }

    this.props.librariesCommander.AddPersistentCharacterFromListing(
      listing,
      hideOnAdd
    );

    return true;
  };

  private editStatBlock = (l: Listing<PersistentCharacter>) => {
    const subscription = l.Listing.subscribe(() => {
      this.filterCache = new FilterCache(this.props.library.GetListings());
      this.forceUpdate(() => subscription.dispose());
    });
    this.props.librariesCommander.EditPersistentCharacterStatBlock(
      l.Listing().Id
    );
  };

  private createAndEditStatBlock = () => {
    const listing = this.props.librariesCommander.CreatePersistentCharacter();
    this.editStatBlock(listing);
  };

  private buildListingComponent = (l: Listing<PersistentCharacter>) => (
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

  public render() {
    const filteredListings = this.filterCache.GetFilteredEntries(
      this.state.filter
    );
    const listingAndFolderComponents = BuildListingTree(
      this.buildListingComponent,
      listing => ({
        label: listing.Listing().Path,
        key: listing.Listing().Path
      }),
      filteredListings
    );

    const previewVisible =
      this.state.previewIconHovered || this.state.previewWindowHovered;

    return (
      <div className="library">
        <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
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
            onClick={this.createAndEditStatBlock}
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
}
