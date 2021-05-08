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
import {
  GetDefaultForLibrary,
  Libraries,
  LibraryFriendlyNames,
  LibraryType
} from "../Libraries";
import { Listing } from "../Listing";
import { EditorView } from "./EditorView";
import { LibraryManagerRow } from "./LibraryManagerRow";
import { SelectedItemsView } from "./SelectedItemsView";
import { Selection, SelectionContext, useSelection } from "./SelectionContext";

export type LibraryManagerProps = {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
};

export function LibraryManager(props: LibraryManagerProps) {
  const [activeTab, setActiveTab] = useState<LibraryType>("StatBlocks");
  const [columnWidth, setColumnWidth] = useState(500);
  const selection = useSelection<Listing<any>>();
  const [editorTypeAndTarget, setEditorTypeAndTarget] = useState<
    [LibraryType, Listing<Listable>] | null
  >(null);

  const activeListingsComponent = renderActiveListingsComponent(
    setEditorTypeAndTarget,
    activeTab,
    props
  );

  const selectedItemsComponent = renderSelectedItemsComponent(
    selection,
    activeTab
  );

  return (
    <SelectionContext.Provider value={selection}>
      <div style={{ display: "flex", flexFlow: "row" }}>
        <div style={{ width: columnWidth }}>
          <Tabs
            optionNamesById={LibraryFriendlyNames}
            selected={activeTab}
            onChoose={tab => setActiveTab(tab)}
          />
          {activeListingsComponent}
        </div>
        <VerticalResizer
          adjustWidth={offset => setColumnWidth(columnWidth + offset)}
        />
        {editorTypeAndTarget && (
          <EditorView
            key={editorTypeAndTarget[1].Meta().Id}
            editorTypeAndTarget={editorTypeAndTarget}
            closeEditor={() => setEditorTypeAndTarget(null)}
            {...props}
          />
        )}
        {selectedItemsComponent}
      </div>
    </SelectionContext.Provider>
  );
}

function renderActiveListingsComponent(
  setEditorTypeAndTarget: (v: [LibraryType, Listing<Listable>]) => void,
  activeTab: LibraryType,
  props: LibraryManagerProps
) {
  const setEditorTarget = React.useCallback(
    (target: Listing<Listable>) => setEditorTypeAndTarget([activeTab, target]),
    [activeTab]
  );

  const pageComponentsByTab: Record<LibraryType, JSX.Element> = {
    StatBlocks: (
      <LibraryManagerListings
        listingsComputed={props.libraries.StatBlocks.GetListings}
        setEditorTarget={setEditorTarget}
      />
    ),
    PersistentCharacters: (
      <LibraryManagerListings
        listingsComputed={props.libraries.PersistentCharacters.GetListings}
        setEditorTarget={setEditorTarget}
      />
    ),
    Spells: (
      <LibraryManagerListings
        listingsComputed={props.libraries.Spells.GetListings}
        setEditorTarget={setEditorTarget}
      />
    ),
    Encounters: (
      <LibraryManagerListings
        listingsComputed={props.libraries.Encounters.GetListings}
        setEditorTarget={setEditorTarget}
      />
    )
  };

  const activeTabComponent = pageComponentsByTab[activeTab];
  return activeTabComponent;
}

function LibraryManagerListings(props: {
  listingsComputed: KnockoutObservable<Listing<any>[]>;
  setEditorTarget: (item: Listing<any>) => void;
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

function renderSelectedItemsComponent(
  selection: Selection<Listing<any>>,
  activeTab: LibraryType
) {
  const partialViewProps = {
    listings: selection.selected,
    friendlyName: LibraryFriendlyNames[activeTab],
    defaultListing: GetDefaultForLibrary(activeTab)
  };

  if (activeTab === "StatBlocks") {
    return (
      <SelectedItemsView
        {...partialViewProps}
        renderListing={statBlock => (
          <div style={{ width: 600 }}>
            <StatBlockComponent displayMode="default" statBlock={statBlock} />
          </div>
        )}
      />
    );
  }

  return null;
}
