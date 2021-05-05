import * as React from "react";
import { Spell } from "../../../common/Spell";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { GetAlphaSortableLevelString } from "../../Utility/GetAlphaSortableLevelString";
import { Listing } from "../Listing";
import { ListingGroupFn } from "../Components/BuildListingTree";
import { LibraryReferencePane } from "./LibraryReferencePane";
import { ListingRow } from "../Components/ListingRow";
import { SpellDetails } from "../Components/SpellDetails";
import { Library } from "../Library";

export type SpellLibraryReferencePaneProps = {
  librariesCommander: LibrariesCommander;
  library: Library<Spell>;
  textEnricher: TextEnricher;
};

type SpellListing = Listing<Spell>;

export class SpellLibraryReferencePane extends React.Component<
  SpellLibraryReferencePaneProps
> {
  constructor(props: SpellLibraryReferencePaneProps) {
    super(props);
    linkComponentToObservables(this);
  }

  public render() {
    return (
      <LibraryReferencePane
        listings={this.props.library.GetListings()}
        renderListingRow={this.renderListingRow}
        defaultItem={Spell.Default()}
        addNewItem={this.props.librariesCommander.CreateAndEditSpell}
        renderPreview={this.renderPreview}
        groupByFunctions={this.groupByFunctions}
      />
    );
  }

  private groupByFunctions: ListingGroupFn[] = [
    l => ({ key: l.Meta().Path }),
    l => ({
      label: LevelOrCantrip(l.Meta().FilterDimensions.Level),
      key: GetAlphaSortableLevelString(l.Meta().FilterDimensions.Level)
    }),
    l => ({ key: l.Meta().FilterDimensions.Type })
  ];

  private renderListingRow = (l: Listing<Spell>, onPreview, onPreviewOut) => {
    const listingMeta = l.Meta();
    return (
      <ListingRow
        key={listingMeta.Id + listingMeta.Path + listingMeta.Name}
        name={listingMeta.Name}
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
    l.Meta.subscribe(_ => this.forceUpdate());
    this.props.librariesCommander.EditSpell(l);
  };
}

function LevelOrCantrip(levelString: string) {
  if (levelString == "0") {
    return "Cantrip";
  }
  return "Level " + levelString;
}
