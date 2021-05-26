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
import { Library } from "../Library";
import { Listing } from "../Listing";
import { DeletePrompt } from "./DeletePrompt";
import { EditorView } from "./EditorView";
import { LibraryManagerRow } from "./LibraryManagerRow";
import { LibraryManagerToolbar } from "./LibraryManagerToolbar";
import { MovePrompt } from "./MovePrompt";
import { SelectedItemsViewForActiveTab } from "./SelectedItemsViewForActiveTab";
import { Selection, SelectionContext, useSelection } from "./SelectionContext";

export type LibraryManagerProps = {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
  closeManager: () => void;
};

type PromptTypeAndTargets = ["move" | "delete", Listing<Listable>[]] | null;

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

  const [promptTypeAndTargets, setPromptTypeAndTargets] = useState<
    PromptTypeAndTargets
  >(null);

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
        <div style={{ width: 600 }}>
          {selection.selected.length > 0 && (
            <div style={{ flexFlow: "row", alignItems: "center" }}>
              <h2 style={{ flexGrow: 1 }}>
                Selected {LibraryFriendlyNames[activeTab]}
              </h2>
              <Button
                text="Move"
                fontAwesomeIcon="folder"
                onClick={() =>
                  setPromptTypeAndTargets(["move", selection.selected])
                }
              />
              <Button
                text="Delete"
                fontAwesomeIcon="trash"
                onClick={() =>
                  setPromptTypeAndTargets(["delete", selection.selected])
                }
              />
            </div>
          )}
          <ActivePrompt
            promptTypeAndTargets={promptTypeAndTargets}
            library={activeLibrary(props.libraries, activeTab)}
            done={() => setPromptTypeAndTargets(null)}
          />
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

function ActivePrompt(props: {
  promptTypeAndTargets: PromptTypeAndTargets;
  library: Library<Listable>;
  done: () => void;
}) {
  if (props.promptTypeAndTargets === null) {
    return null;
  }
  if (props.promptTypeAndTargets[0] === "move") {
    return <MovePrompt {...props} targets={props.promptTypeAndTargets[1]} />;
  }
  if (props.promptTypeAndTargets[0] === "delete") {
    return <DeletePrompt {...props} targets={props.promptTypeAndTargets[1]} />;
  }
  return null;
}

function activeLibrary(
  libraries: Libraries,
  libraryType: LibraryType
): Library<Listable> | null {
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

  return <ul className="listings zebra-stripe">{listingTree}</ul>;
}
