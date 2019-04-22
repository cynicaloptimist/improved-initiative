import * as React from "react";
import { Spell } from "../../../common/Spell";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { Listing } from "../Listing";
import { SpellLibrary } from "../SpellLibrary";
import { LibraryPane } from "./LibraryPane";
import { ListingRow } from "./ListingRow";
import { SpellDetails } from "./SpellDetails";

export type SpellLibraryPaneProps = {
  librariesCommander: LibrariesCommander;
  library: SpellLibrary;
  textEnricher: TextEnricher;
};

type SpellListing = Listing<Spell>;

export class SpellLibraryPane extends React.Component<SpellLibraryPaneProps> {
  constructor(props: SpellLibraryPaneProps) {
    super(props);
    linkComponentToObservables(this);
  }

  public render() {
    return (
      <LibraryPane
        listings={this.props.library.GetSpells()}
        renderListingRow={this.renderListingRow}
        defaultItem={Spell.Default()}
        addNewItem={this.props.librariesCommander.CreateAndEditSpell}
        hideLibraries={this.props.librariesCommander.HideLibraries}
        renderPreview={this.renderPreview}
        groupByFunctions={this.groupByFunctions}
      />
    );
  }

  private groupByFunctions = [l => ({ key: l.Listing().Path })];

  private renderListingRow = (listing, onPreview, onPreviewOut) => (
    <ListingRow
      key={
        listing.Listing().Id + listing.Listing().Path + listing.Listing().Name
      }
      name={listing.Listing().Name}
      onAdd={this.loadSavedSpell}
      onEdit={this.editSpell}
      onPreview={onPreview}
      onPreviewOut={onPreviewOut}
      listing={listing}
    />
  );

  private renderPreview = (spell: Spell) => (
    <div className="spell-preview">
      <SpellDetails Spell={spell} TextEnricher={this.props.textEnricher} />
    </div>
  );

  private loadSavedSpell = (listing: SpellListing) => {
    return this.props.librariesCommander.ReferenceSpell(listing);
  };

  private editSpell = (l: Listing<Spell>) => {
    l.Listing.subscribe(_ => this.forceUpdate());
    this.props.librariesCommander.EditSpell(l);
  };
}
