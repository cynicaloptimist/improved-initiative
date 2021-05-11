import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { Spell } from "../../../common/Spell";
import { StatBlock } from "../../../common/StatBlock";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { Tabs } from "../../Components/Tabs";
import { VerticalResizer } from "../../Layout/VerticalResizer";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { BuildListingTree } from "../Components/BuildListingTree";
import { Libraries, LibraryFriendlyNames, LibraryType } from "../Libraries";
import { Listing } from "../Listing";
import { EditorView } from "./EditorView";
import { LibraryManagerRow } from "./LibraryManagerRow";
import { MovePrompt } from "./MovePrompt";
import { SelectedItemsViewForActiveTab } from "./SelectedItemsViewForActiveTab";
import { Selection, SelectionContext, useSelection } from "./SelectionContext";

export type LibraryManagerProps = {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
};

export function LibraryManager(props: LibraryManagerProps) {
  const [activeTab, setActiveTab] = useState<LibraryType>("StatBlocks");
  const [columnWidth, setColumnWidth] = useState(500);
  const selectionsByTab: Record<LibraryType, Selection<Listing<Listable>>> = {
    StatBlocks: useSelection<Listing<StatBlock>>(),
    PersistentCharacters: useSelection<Listing<PersistentCharacter>>(),
    Encounters: useSelection<Listing<SavedEncounter>>(),
    Spells: useSelection<Listing<Spell>>()
  };
  const selection = selectionsByTab[activeTab];

  const [editorTypeAndTarget, setEditorTypeAndTarget] = useState<
    [LibraryType, Listing<Listable>] | null
  >(null);
  const setEditorTarget = React.useCallback(
    (target: Listing<Listable>) => setEditorTypeAndTarget([activeTab, target]),
    [activeTab]
  );

  const [moveTargets, setMoveTargets] = useState<Listing<Listable>[] | null>(
    null
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
          <div style={{ overflowY: "auto" }}>
            <LibraryManagerListings
              key={activeTab}
              listingsComputed={
                activeLibrary(props.libraries, activeTab).GetListings
              }
              setEditorTarget={setEditorTarget}
            />
          </div>
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
        <div>
          {selection.selected.length > 0 && (
            <div style={{ flexFlow: "row" }}>
              <Button
                text="Move"
                fontAwesomeIcon="folder"
                onClick={() => setMoveTargets(selection.selected)}
              />
            </div>
          )}
          {moveTargets && (
            <MovePrompt
              targets={moveTargets}
              library={activeLibrary(props.libraries, activeTab)}
              done={() => setMoveTargets(null)}
            />
          )}
          <div style={{ flexShrink: 1 }}>
            <SelectedItemsViewForActiveTab
              selection={selection}
              activeTab={activeTab}
            />
          </div>
        </div>
      </div>
    </SelectionContext.Provider>
  );
}

function activeLibrary(libraries: Libraries, libraryType: LibraryType) {
  if (libraryType === "StatBlocks") {
    return libraries.StatBlocks;
  }
  if (libraryType === "PersistentCharacters") {
    return libraries.PersistentCharacters;
  }
  if (libraryType === "Encounters") {
    return libraries.Encounters;
  }
  if (libraryType === "Spells") {
    return libraries.Spells;
  }

  return null;
}

function LibraryManagerListings(props: {
  listingsComputed: KnockoutObservable<Listing<any>[]>;
  setEditorTarget: (item: Listing<any>) => void;
}) {
  const listings = useSubscription(props.listingsComputed);
  const listingTree = BuildListingTree(
    l => <LibraryManagerRow key={l.Meta().Id} listing={l} {...props} />,
    l => ({ key: l.Meta().Path }),
    listings
  );

  return (
    <div style={{ display: "flex", flexFlow: "column" }}>{listingTree}</div>
  );
}
