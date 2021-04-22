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
  const [activeTab, setActiveTab] = useState("Creatures");
  const [columnWidth, setColumnWidth] = useState(500);
  const selection = useSelection<Listing<any>>();
  const [editorTarget, setEditorTarget] = useState<Listable | null>(null);

  const pageComponentsByTab = {
    Creatures: (
      <LibraryManagerListings
        listingsComputed={props.libraries.StatBlocks.GetStatBlocks}
        defaultListing={StatBlock.Default()}
        setEditorTarget={setEditorTarget}
      />
    ),
    Characters: (
      <LibraryManagerListings
        listingsComputed={props.libraries.PersistentCharacters.GetListings}
        defaultListing={StatBlock.Default()}
        setEditorTarget={setEditorTarget}
      />
    ),
    Spells: (
      <LibraryManagerListings
        listingsComputed={props.libraries.Spells.GetSpells}
        defaultListing={StatBlock.Default()}
        setEditorTarget={setEditorTarget}
      />
    ),
    Encounters: (
      <LibraryManagerListings
        listingsComputed={props.libraries.Encounters.Encounters}
        defaultListing={StatBlock.Default()}
        setEditorTarget={setEditorTarget}
      />
    )
  };

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
          {editorTarget == null ? (
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
          ) : (
            <EditorView editorTarget={editorTarget} />
          )}
        </div>
      </div>
    </SelectionContext.Provider>
  );
}

function EditorView(props: { editorTarget: Listable }) {
  return <>{props.editorTarget.Name}</>;
}

function LibraryManagerListings(props: {
  listingsComputed: KnockoutObservable<Listing<any>[]>;
  defaultListing: Listable;
  setEditorTarget: (item: Listable) => void;
}) {
  const listings = useSubscription(props.listingsComputed);
  return (
    <div style={{ display: "flex", flexFlow: "column" }}>
      {listings.map(l => (
        <LibraryManagerRow key={l.Meta().Id} listing={l} {...props} />
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
