import * as React from "react";
import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { Spell } from "../../../common/Spell";
import { StatBlock } from "../../../common/StatBlock";
import { StatBlockComponent } from "../../Components/StatBlock";
import { TextEnricherContext } from "../../TextEnricher/TextEnricher";
import { DifficultyCalculator } from "../../Widgets/DifficultyCalculator";
import { SpellDetails } from "../Components/SpellDetails";
import { GetDefaultForLibrary, LibraryType } from "../Libraries";
import { Listing } from "../Listing";
import { SelectedItemsView } from "./SelectedItemsView";
import { Selection } from "./SelectionContext";

export function SelectedItemsViewForActiveTab({
  selection,
  activeTab
}: {
  selection: Selection<Listing<any>>;
  activeTab: LibraryType;
}) {
  const partialViewProps = {
    key: activeTab,
    listings: selection.selected || [],
    defaultListing: GetDefaultForLibrary(activeTab)
  };

  const textEnricher = React.useContext(TextEnricherContext);

  if (activeTab === "StatBlocks") {
    return (
      <SelectedItemsView
        {...partialViewProps}
        renderListing={(listing: StatBlock) => (
          <div style={{ width: 600 }}>
            <StatBlockComponent displayMode="default" statBlock={listing} />
          </div>
        )}
      />
    );
  }

  if (activeTab === "PersistentCharacters") {
    return (
      <SelectedItemsView
        {...partialViewProps}
        renderListing={(listing: PersistentCharacter) => (
          <div style={{ width: 600 }}>
            <StatBlockComponent
              displayMode="default"
              statBlock={listing.StatBlock}
            />
          </div>
        )}
      />
    );
  }

  if (activeTab === "Encounters") {
    return (
      <SelectedItemsView
        {...partialViewProps}
        renderListing={(listing: SavedEncounter) => {
          const encounterDifficulty = DifficultyCalculator.Calculate(
            listing.Combatants.map(c => c.StatBlock.Challenge),
            []
          );

          return (
            <div style={{ width: 600 }}>
              <h2>{listing.Name}</h2>
              <div>XP: {encounterDifficulty.EarnedExperience}</div>
              {listing.Combatants.map(c => (
                <div key={c.Id}>
                  <span>{c.StatBlock.Name}</span>
                </div>
              ))}
            </div>
          );
        }}
      />
    );
  }

  if (activeTab === "Spells") {
    return (
      <SelectedItemsView
        {...partialViewProps}
        renderListing={(listing: Spell) => {
          return <SpellDetails Spell={listing} TextEnricher={textEnricher} />;
        }}
      />
    );
  }

  return null;
}
