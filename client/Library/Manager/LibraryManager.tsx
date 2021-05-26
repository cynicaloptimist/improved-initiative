import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { Spell } from "../../../common/Spell";
import { StatBlock } from "../../../common/StatBlock";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Tabs } from "../../Components/Tabs";
import { VerticalResizer } from "../../Layout/VerticalResizer";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { BuildListingTree } from "../Components/BuildListingTree";
import { Libraries, LibraryFriendlyNames, LibraryType } from "../Libraries";
import { Listing } from "../Listing";
import { ActiveLibrary } from "./ActiveLibrary";
import { EditorView } from "./EditorView";
import { LibraryManagerRow } from "./LibraryManagerRow";
import { LibraryManagerToolbar } from "./LibraryManagerToolbar";
import { SelectedItemsManager } from "./SelectedItemsManager";
import { Selection, SelectionContext, useSelection } from "./SelectionContext";

export type LibraryManagerProps = {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
  closeManager: () => void;
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

  return (
    <SelectionContext.Provider value={selection}>
      <div className="c-library-manager">
        <LibraryManagerToolbar closeManager={props.closeManager} />
        <div style={{ width: columnWidth }}>
          <Tabs
            optionNamesById={LibraryFriendlyNames}
            selected={activeTab}
            onChoose={tab => setActiveTab(tab)}
          />
          <div className="library">
            <LibraryManagerListings
              key={activeTab}
              listingsComputed={
                ActiveLibrary(props.libraries, activeTab).GetListings
              }
              setEditorTarget={setEditorTarget}
            />
          </div>
        </div>
        <VerticalResizer
          adjustWidth={offset => setColumnWidth(columnWidth + offset)}
        />
        <SelectedItemsManager
          activeTab={activeTab}
          libraries={props.libraries}
        />
        {editorTypeAndTarget && (
          <EditorView
            key={editorTypeAndTarget[1].Meta().Id}
            editorTypeAndTarget={editorTypeAndTarget}
            closeEditor={() => setEditorTypeAndTarget(null)}
            {...props}
          />
        )}
      </div>
    </SelectionContext.Provider>
  );
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

  return <ul className="listings zebra-stripe">{listingTree}</ul>;
}
