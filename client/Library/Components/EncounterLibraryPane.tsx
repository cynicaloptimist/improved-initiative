import * as React from "react";
import { CombatantState } from "../../../common/CombatantState";
import { EncounterState, SavedEncounter } from "../../../common/EncounterState";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { EncounterLibrary } from "../EncounterLibrary";
import { Listing } from "../Listing";
import { ListingGroupFn } from "./BuildListingTree";
import { LibraryPane } from "./LibraryPane";
import { ListingRow } from "./ListingRow";

export type EncounterLibraryPaneProps = {
  librariesCommander: LibrariesCommander;
  library: EncounterLibrary;
};

type EncounterListing = Listing<SavedEncounter>;

export class EncounterLibraryPane extends React.Component<
  EncounterLibraryPaneProps
> {
  constructor(props: EncounterLibraryPaneProps) {
    super(props);
    linkComponentToObservables(this);
  }

  public render() {
    const listings = this.props.library.Encounters();
    return (
      <LibraryPane
        listings={listings}
        defaultItem={SavedEncounter.Default()}
        renderListingRow={this.renderListingRow}
        groupByFunctions={this.groupByFunctions}
        addNewItem={this.props.librariesCommander.SaveEncounter}
        hideLibraries={this.props.librariesCommander.HideLibraries}
        renderPreview={this.renderPreview}
      />
    );
  }

  private groupByFunctions: ListingGroupFn[] = [
    l => ({ key: l.Listing().Path })
  ];

  private renderListingRow = (
    listing: EncounterListing,
    onPreview,
    onPreviewOut
  ) => (
    <ListingRow
      key={
        listing.Listing().Id + listing.Listing().Path + listing.Listing().Name
      }
      name={listing.Listing().Name}
      onAdd={this.loadSavedEncounter}
      onDelete={this.deleteListing}
      onMove={this.moveListing}
      onPreview={onPreview}
      onPreviewOut={onPreviewOut}
      listing={listing}
      showCount
    />
  );

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
