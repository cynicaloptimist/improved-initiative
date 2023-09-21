import * as React from "react";
import { Spell } from "../../../common/Spell";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { GetAlphaSortableLevelString } from "../../Utility/GetAlphaSortableLevelString";
import { Listing } from "../Listing";
import { ListingGroup } from "../Components/BuildListingTree";
import { LibraryReferencePane } from "./LibraryReferencePane";
import { ListingRow } from "../Components/ListingRow";
import { SpellDetails } from "../Components/SpellDetails";
import { Library } from "../useLibrary";

export type SpellLibraryReferencePaneProps = {
  librariesCommander: LibrariesCommander;
  library: Library<Spell>;
};

type SpellListing = Listing<Spell>;

export class SpellLibraryReferencePane extends React.Component<SpellLibraryReferencePaneProps> {
  constructor(props: SpellLibraryReferencePaneProps) {
    super(props);
    linkComponentToObservables(this);
  }

  public render(): JSX.Element {
    return (
      <LibraryReferencePane
        listings={this.props.library.GetAllListings()}
        renderListingRow={this.renderListingRow}
        defaultItem={Spell.Default()}
        addNewItem={this.props.librariesCommander.CreateAndEditSpell}
        renderPreview={this.renderPreview}
        listingGroups={this.listingGroups}
        showPreloadInfo
      />
    );
  }

  private listingGroups: ListingGroup[] = [
    {
      label: "Folder",
      groupFn: l => ({ key: l.Meta().Path })
    },
    {
      label: "Level",
      groupFn: l => ({
        label: LevelOrCantrip(l.Meta().FilterDimensions.Level),
        key: GetAlphaSortableLevelString(l.Meta().FilterDimensions.Level)
      })
    },
    {
      label: "Type",
      groupFn: l => ({ key: l.Meta().FilterDimensions.Type })
    }
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
      <SpellDetails Spell={spell} />
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
