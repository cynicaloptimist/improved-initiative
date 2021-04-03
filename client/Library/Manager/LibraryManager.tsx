import * as React from "react";
import { useState } from "react";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Tabs } from "../../Components/Tabs";
import { VerticalResizer } from "../../Layout/VerticalResizer";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { Libraries } from "../Libraries";
import { Listing } from "../Listing";

type SelectionContext<T> = {
  selected: T[];
  setSelected: (val: T) => void;
  addSelected: (val: T) => void;
  clearSelected: () => void;
};

const SelectionContext = React.createContext<SelectionContext<Listing<any>>>({
  selected: [],
  setSelected: () => {},
  addSelected: () => {},
  clearSelected: () => {}
});

function useSelection<T>(): SelectionContext<T> {
  const [selected, setSelectedItems] = useState<T[]>([]);
  const setSelected = React.useCallback(
    (selected: T) => {
      setSelectedItems([selected]);
    },
    [setSelectedItems]
  );
  const addSelected = React.useCallback(
    (newSelected: T) => {
      if (!selected.includes(newSelected)) {
        setSelectedItems([...selected, newSelected]);
      }
    },
    [selected, setSelectedItems]
  );
  const clearSelected = React.useCallback(() => {
    setSelectedItems([]);
  }, [setSelectedItems]);

  return {
    selected,
    setSelected,
    addSelected,
    clearSelected
  };
}

export function LibraryManager(props: {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
}) {
  const pageComponentsByTab = {
    Creatures: (
      <LibraryManagerListing
        listingsComputed={props.libraries.StatBlocks.GetStatBlocks}
      />
    ),
    Characters: (
      <LibraryManagerListing
        listingsComputed={props.libraries.PersistentCharacters.GetListings}
      />
    ),
    Spells: (
      <LibraryManagerListing
        listingsComputed={props.libraries.Spells.GetSpells}
      />
    ),
    Encounters: (
      <LibraryManagerListing
        listingsComputed={props.libraries.Encounters.Encounters}
      />
    )
  };

  const [activeTab, setActiveTab] = useState("Creatures");
  const [columnWidth, setColumnWidth] = useState(500);
  const selectionContext = useSelection<Listing<any>>();

  return (
    <SelectionContext.Provider value={selectionContext}>
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
    </SelectionContext.Provider>
  );
}

type Action<T> = (val: T) => void;
type Void = () => void;

function LibraryManagerListing(props: {
  listingsComputed: KnockoutObservable<Listing<any>[]>;
}) {
  const listings = useSubscription(props.listingsComputed);
  return (
    <div style={{ display: "flex", flexFlow: "column" }}>
      {listings.map(l => (
        <LibraryManagerRow key={l.Listing().Id} listing={l} />
      ))}
    </div>
  );
}

function LibraryManagerRow(props: { listing: Listing<any> }) {
  const listing = useSubscription(props.listing.Listing);
  const selection = React.useContext(SelectionContext);
  const isSelected = selection.selected.includes(props.listing);
  return (
    <div
      style={{
        backgroundColor: isSelected ? "red" : undefined,
        userSelect: "none"
      }}
      onClick={mouseEvent => {
        if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
          selection.addSelected(props.listing);
        } else {
          selection.setSelected(props.listing);
        }
      }}
    >
      {listing.Name}
    </div>
  );
}
