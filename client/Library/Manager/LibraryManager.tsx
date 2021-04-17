import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { StatBlock } from "../../../common/StatBlock";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { StatBlockComponent } from "../../Components/StatBlock";
import { Tabs } from "../../Components/Tabs";
import { VerticalResizer } from "../../Layout/VerticalResizer";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { Libraries } from "../Libraries";
import { Listing } from "../Listing";
import { LibraryManagerRow } from "./LibraryManagerRow";
import { SelectionContext, useSelection } from "./SelectionContext";

export function LibraryManager(props: {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
}) {
  const pageComponentsByTab = {
    Creatures: (
      <LibraryManagerListings
        listingsComputed={props.libraries.StatBlocks.GetStatBlocks}
      />
    ),
    Characters: (
      <LibraryManagerListings
        listingsComputed={props.libraries.PersistentCharacters.GetListings}
      />
    ),
    Spells: (
      <LibraryManagerListings
        listingsComputed={props.libraries.Spells.GetSpells}
      />
    ),
    Encounters: (
      <LibraryManagerListings
        listingsComputed={props.libraries.Encounters.Encounters}
      />
    )
  };

  const [activeTab, setActiveTab] = useState("Creatures");
  const [columnWidth, setColumnWidth] = useState(500);
  const selection = useSelection<Listing<any>>();

  return (
    <SelectionContext.Provider value={selection}>
      <div style={{ display: "flex", flexFlow: "row" }}>
        <div style={{ width: columnWidth }}>
          <Tabs
            options={Object.keys(pageComponentsByTab)}
            selected={activeTab}
            onChoose={setActiveTab}
          />
          {pageComponentsByTab[activeTab]}
        </div>
        <VerticalResizer
          adjustWidth={offset => setColumnWidth(columnWidth + offset)}
        />
        <div>
          <SelectedItemsView
            listings={selection.selected}
            friendlyName="Statblocks"
            defaultListing={StatBlock.Default()}
            renderListing={statBlock => (
              <div style={{ width: 600 }}>
                <StatBlockComponent
                  displayMode="default"
                  statBlock={statBlock}
                />
              </div>
            )}
          />
        </div>
      </div>
    </SelectionContext.Provider>
  );
}

function LibraryManagerListings(props: {
  listingsComputed: KnockoutObservable<Listing<any>[]>;
}) {
  const listings = useSubscription(props.listingsComputed);
  return (
    <div style={{ display: "flex", flexFlow: "column" }}>
      {listings.map(l => (
        <LibraryManagerRow key={l.Meta().Id} listing={l} />
      ))}
    </div>
  );
}

function SelectedItemsView<T extends Listable>(props: {
  listings: Listing<T>[];
  defaultListing: T;
  renderListing: (item: T) => JSX.Element;
  friendlyName: string;
}) {
  const [loadedItemsById, setLoadedItemsById] = useState<Record<string, T>>({});

  React.useEffect(() => {
    setLoadedItemsById({});
    props.listings.forEach(async listing => {
      const item = await listing.GetWithTemplate(props.defaultListing);
      setLoadedItemsById(loaded => ({
        ...loaded,
        [listing.Meta().Id]: item
      }));
    });
  }, [props.listings]);

  const loadedItems = Object.values(loadedItemsById);

  if (loadedItems.length === 0) {
    return null;
  }
  if (props.listings.length === 1 && loadedItems.length === 1) {
    return props.renderListing(loadedItems[0]);
  } else {
    return (
      <div>
        <strong>Selected {props.friendlyName}</strong>
        {props.listings.map(listing => {
          return <div key={listing.Meta().Id}>{listing.Meta().Name}</div>;
        })}
      </div>
    );
  }
}
