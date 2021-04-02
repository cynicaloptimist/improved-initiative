import * as React from "react";
import { useState } from "react";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Tabs } from "../../Components/Tabs";
import { VerticalResizer } from "../../Layout/VerticalResizer";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { Libraries } from "../Libraries";
import { Listing } from "../Listing";

export function LibraryManager(props: {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
}) {
  const pageComponentsByTab = {
    Creatures: (
      <LibraryManagerPane
        listingsComputed={props.libraries.StatBlocks.GetStatBlocks}
      />
    ),
    Characters: (
      <LibraryManagerPane
        listingsComputed={props.libraries.PersistentCharacters.GetListings}
      />
    ),
    Spells: (
      <LibraryManagerPane listingsComputed={props.libraries.Spells.GetSpells} />
    ),
    Encounters: (
      <LibraryManagerPane
        listingsComputed={props.libraries.Encounters.Encounters}
      />
    )
  };

  const [activeTab, setActiveTab] = useState("Creatures");
  const [columnWidth, setColumnWidth] = useState(500);
  return (
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
      <div>Viewer/Editor</div>
    </div>
  );
}

type Action<T> = (val: T) => void;
type Void = () => void;

function useSelection<T>(items: T[]): [T[], Action<T>, Action<T>, Void] {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const setSelected = React.useCallback(
    (selected: T) => {
      setSelectedItems([selected]);
    },
    [items]
  );
  const addSelected = React.useCallback(
    (selected: T) => {
      if (!selectedItems.includes(selected)) {
        setSelectedItems([...selectedItems, selected]);
      }
    },
    [items]
  );
  const clearSelected = React.useCallback(() => {
    setSelectedItems([]);
  }, [items]);

  return [selectedItems, setSelected, addSelected, clearSelected];
}

function LibraryManagerPane(props: {
  listingsComputed: KnockoutObservable<Listing<any>[]>;
}) {
  const listings = useSubscription(props.listingsComputed);
  const [selected, setSelected, addSelected, clearSelected] = useSelection(
    listings
  );
  return (
    <div style={{ display: "flex", flexFlow: "column" }}>
      {listings.map(l => (
        <LibraryManagerRow
          key={l.Listing().Id}
          listing={l}
          isSelected={selected.includes(l)}
          setSelected={setSelected}
        />
      ))}
    </div>
  );
}

function LibraryManagerRow(props: {
  listing: Listing<any>;
  setSelected: Action<Listing<any>>;
  isSelected: boolean;
}) {
  const listing = useSubscription(props.listing.Listing);
  return (
    <div
      style={{
        backgroundColor: props.isSelected ? "red" : undefined
      }}
      onClick={() => props.setSelected(props.listing)}
    >
      {listing.Name}
    </div>
  );
}
