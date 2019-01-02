import * as React from "react";
import { Spell } from "../../../common/Spell";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { FilterCache } from "../FilterCache";
import { Listing } from "../Listing";
import { SpellLibrary } from "../SpellLibrary";
import { LibraryFilter } from "./LibraryFilter";
import { ListingViewModel } from "./Listing";

export type SpellLibraryViewModelProps = {
  librariesCommander: LibrariesCommander;
  library: SpellLibrary;
};

type SpellListing = Listing<Spell>;

interface State {
  filter: string;
}

export class SpellLibraryViewModel extends React.Component<
  SpellLibraryViewModelProps,
  State
> {
  constructor(props: SpellLibraryViewModelProps) {
    super(props);
    this.state = {
      filter: ""
    };

    this.filterCache = new FilterCache(this.props.library.Spells());
  }

  public componentDidMount() {
    this.librarySubscription = this.props.library.Spells.subscribe(
      newSpells => {
        this.filterCache = new FilterCache(newSpells);
        this.forceUpdate();
      }
    );
  }

  public componentWillUnmount() {
    this.librarySubscription.dispose();
  }

  private filterCache: FilterCache<SpellListing>;
  private librarySubscription: KnockoutSubscription;

  private loadSavedSpell = (listing: SpellListing, hideOnAdd: boolean) => {
    this.props.librariesCommander.ReferenceSpell(listing);
  };

  private editSpell = (l: Listing<Spell>) => {
    l.CurrentName.subscribe(_ => this.forceUpdate());
    this.props.librariesCommander.EditSpell(l);
  };

  public render() {
    const filteredListings = this.filterCache.GetFilteredEntries(
      this.state.filter
    );

    return (
      <div className="library">
        <LibraryFilter applyFilterFn={filter => this.setState({ filter })} />
        <ul className="listings">
          {filteredListings.map(l => (
            <ListingViewModel
              key={l.Id + l.Path + l.CurrentName()}
              name={l.CurrentName()}
              onAdd={this.loadSavedSpell}
              onEdit={this.editSpell}
              listing={l}
            />
          ))}
        </ul>
        <div className="buttons">
          <Button
            additionalClassNames="hide"
            fontAwesomeIcon="chevron-up"
            onClick={() => this.props.librariesCommander.HideLibraries()}
          />
          <Button
            additionalClassNames="new"
            fontAwesomeIcon="plus"
            onClick={() => this.props.librariesCommander.CreateAndEditSpell()}
          />
        </div>
      </div>
    );
  }
}
