import * as React from "react";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { EncounterLibrary } from "../EncounterLibrary";
import { Listing } from "../Listing";
import { ListingGroupFn } from "../Components/BuildListingTree";
import { LibraryReferencePane } from "./LibraryReferencePane";
import { ListingRow } from "../Components/ListingRow";

export type EncounterLibraryReferencePaneProps = {
  librariesCommander: LibrariesCommander;
  library: EncounterLibrary;
};

type EncounterListing = Listing<SavedEncounter>;

export class EncounterLibraryReferencePane extends React.Component<
  EncounterLibraryReferencePaneProps
> {
  constructor(props: EncounterLibraryReferencePaneProps) {
    super(props);
    linkComponentToObservables(this);
  }

  public render() {
    const listings = this.props.library.Encounters();
    return (
      <LibraryReferencePane
        listings={listings}
        defaultItem={SavedEncounter.Default()}
        renderListingRow={this.renderListingRow}
        groupByFunctions={this.groupByFunctions}
        addNewItem={this.props.librariesCommander.SaveEncounter}
        renderPreview={this.renderPreview}
      />
    );
  }

  private groupByFunctions: ListingGroupFn[] = [
    l => ({ key: l.Listing().Path })
  ];

  private renderListingRow = (l: EncounterListing, onPreview, onPreviewOut) => {
    const storedListing = l.Listing();
    return (
      <ListingRow
        key={storedListing.Id + storedListing.Path + storedListing.Name}
        name={storedListing.Name}
        onAdd={this.loadSavedEncounter}
        onDelete={this.deleteListing}
        onMove={this.moveListing}
        onPreview={onPreview}
        onPreviewOut={onPreviewOut}
        listing={l}
        showCount
      />
    );
  };

  private renderPreview = (encounter: SavedEncounter) => (
    <ul className="c-encounter-preview">
      {encounter.Combatants.map(c => (
        <li key={c.Id}>{c.Alias || c.StatBlock.Name}</li>
      ))}
    </ul>
  );

  private loadSavedEncounter = (listing: EncounterListing) => {
    listing.GetAsyncWithUpdatedId(this.props.librariesCommander.LoadEncounter);
    return true;
  };

  private deleteListing = (listing: EncounterListing) => {
    if (confirm(`Delete saved encounter "${listing.Listing().Name}"?`)) {
      this.props.library.Delete(listing);
    }
  };

  private moveListing = (listing: EncounterListing) => {
    listing.GetAsyncWithUpdatedId(savedEncounter =>
      this.props.librariesCommander.MoveEncounter(savedEncounter)
    );
  };
}
