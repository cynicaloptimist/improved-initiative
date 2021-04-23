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

type LibraryManagerProps = {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
};

type ListableType = "Creatures" | "Characters" | "Spells" | "Encounters";

export function LibraryManager(props: LibraryManagerProps) {
  const [activeTab, setActiveTab] = useState<ListableType>("Creatures");
  const [columnWidth, setColumnWidth] = useState(500);
  const selection = useSelection<Listing<any>>();
  const [editorTypeAndTarget, setEditorTypeAndTarget] = useState<
    [ListableType, Listable] | null
  >(null);

  const pageComponentsByTab: Record<ListableType, JSX.Element> = {
    Creatures: (
      <LibraryManagerListings
        listingsComputed={props.libraries.StatBlocks.GetStatBlocks}
        defaultListing={StatBlock.Default()}
        setEditorTarget={t => setEditorTypeAndTarget(["Creatures", t])}
      />
    ),
    Characters: (
      <LibraryManagerListings
        listingsComputed={props.libraries.PersistentCharacters.GetListings}
        defaultListing={StatBlock.Default()}
        setEditorTarget={t => setEditorTypeAndTarget(["Characters", t])}
      />
    ),
    Spells: (
      <LibraryManagerListings
        listingsComputed={props.libraries.Spells.GetSpells}
        defaultListing={StatBlock.Default()}
        setEditorTarget={t => setEditorTypeAndTarget(["Spells", t])}
      />
    ),
    Encounters: (
      <LibraryManagerListings
        listingsComputed={props.libraries.Encounters.Encounters}
        defaultListing={StatBlock.Default()}
        setEditorTarget={t => setEditorTypeAndTarget(["Encounters", t])}
      />
    )
  };

  return (
    <SelectionContext.Provider value={selection}>
      <div style={{ display: "flex", flexFlow: "row" }}>
        <div style={{ width: columnWidth }}>
          <Tabs
            options={Object.keys(pageComponentsByTab) as ListableType[]}
            selected={activeTab}
            onChoose={setActiveTab}
          />
          {pageComponentsByTab[activeTab]}
        </div>
        <VerticalResizer
          adjustWidth={offset => setColumnWidth(columnWidth + offset)}
        />
        {editorTypeAndTarget && (
          <EditorView editorTypeAndTarget={editorTypeAndTarget} {...props} />
        )}
        <SelectedItemsView
          listings={selection.selected}
          friendlyName="Statblocks"
          defaultListing={StatBlock.Default()}
          renderListing={statBlock => (
            <div style={{ width: 600 }}>
              <StatBlockComponent displayMode="default" statBlock={statBlock} />
            </div>
          )}
        />
      </div>
    </SelectionContext.Provider>
  );
}

function EditorView(
  props: LibraryManagerProps & { editorTypeAndTarget: [ListableType, Listable] }
) {
  const [editorType, editorTarget] = props.editorTypeAndTarget;
  return <div>{editorTarget.Name}</div>;
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
      <div className="c-statblock-header">
        <strong>Selected {props.friendlyName}</strong>
        {props.listings.map(listing => {
          return (
            <h3 key={listing.Meta().Id} className="Name">
              {listing.Meta().Name}
            </h3>
          );
        })}
      </div>
    );
  }
}
