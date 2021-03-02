import * as React from "react";
import { Spell } from "../../../common/Spell";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { GetAlphaSortableLevelString } from "../../Utility/GetAlphaSortableLevelString";
import { Listing } from "../Listing";
import { SpellLibrary } from "../SpellLibrary";
import { ListingGroupFn } from "../Components/BuildListingTree";
import { LibraryReferencePane } from "./LibraryReferencePane";
import { ListingRow } from "../Components/ListingRow";
import { SpellDetails } from "../Components/SpellDetails";

export type SpellLibraryReferencePaneProps = {
  librariesCommander: LibrariesCommander;
  library: SpellLibrary;
  textEnricher: TextEnricher;
};

type SpellListing = Listing<Spell>;

export class SpellLibraryReferencePane extends React.Component<SpellLibraryReferencePaneProps> {
  constructor(props: SpellLibraryReferencePaneProps) {
    super(props);
    linkComponentToObservables(this);
  }

  public render() {
    return (
      <LibraryReferencePane
        listings={this.props.library.GetSpells()}
        renderListingRow={this.renderListingRow}
        defaultItem={Spell.Default()}
        addNewItem={this.props.librariesCommander.CreateAndEditSpell}
        renderPreview={this.renderPreview}
        groupByFunctions={this.groupByFunctions}
      />
    );
  }

  private groupByFunctions: ListingGroupFn[] = [
    l => ({ key: l.Listing().Path }),
    l => ({
      label: LevelOrCantrip(l.Listing().Metadata.Level),
      key: GetAlphaSortableLevelString(l.Listing().Metadata.Level)
    }),
    l => ({ key: l.Listing().Metadata.Type })
  ];

  private renderListingRow = (l, onPreview, onPreviewOut) => {
    const storedListing = l.Listing();
    return (
      <ListingRow
        key={storedListing.Id + storedListing.Path + storedListing.Name}
        name={storedListing.Name}
        onAdd={this.loadSavedSpell}
        onEdit={this.editSpell}
        onPreview={onPreview}
        onPreviewOut={onPreviewOut}
        listing={l}
      />
    );
  };

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

function LevelOrCantrip(levelString: string) {
  if (levelString == "0") {
    return "Cantrip";
  }
  return "Level " + levelString;
}
