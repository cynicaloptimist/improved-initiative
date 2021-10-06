import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { Spell } from "../../../common/Spell";
import { StatBlock } from "../../../common/StatBlock";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { Tabs } from "../../Components/Tabs";
import { VerticalResizer } from "../../Layout/VerticalResizer";
import { BuildListingTree } from "../Components/BuildListingTree";
import { LibraryFilter } from "../Components/LibraryFilter";
import { PaneHeader } from "../Components/PaneHeader";
import { FilterCache } from "../FilterCache";
import { Libraries, LibraryFriendlyNames, LibraryType } from "../Libraries";
import { Listing } from "../Listing";
import { ActiveLibrary } from "./ActiveLibrary";
import { EditorView } from "./EditorView";
import { LibraryManagerRow } from "./LibraryManagerRow";
import { SelectedItemsManager } from "./SelectedItemsManager";
import { Selection, SelectionContext, useSelection } from "./SelectionContext";

export type LibraryManagerProps = {
  librariesCommander: LibrariesCommander;
  libraries: Libraries;
  closeManager: () => void;
  initialPane?: LibraryType;
};

export function LibraryManager(props: LibraryManagerProps) {
  const [activeTab, setActiveTab] = useState<LibraryType>(
    props.initialPane || "StatBlocks"
  );
  const [leftColumnWidth, setLeftColumnWidth] = useState(500);
  const [centerColumnWidth, setCenterColumnWidth] = useState(600);
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
        <div className="left-column" style={{ width: leftColumnWidth }}>
          <PaneHeader
            title="Library Manager"
            fontAwesomeIcon="book-open"
            buttons={
              <Button
                additionalClassNames="button--close"
                fontAwesomeIcon="times"
                onClick={props.closeManager}
                tooltip="Close Library Manager"
              />
            }
          />
          <Tabs
            optionNamesById={LibraryFriendlyNames}
            selected={activeTab}
            onChoose={tab => setActiveTab(tab)}
          />
          <LibraryManagerListings
            key={activeTab}
            listings={ActiveLibrary(
              props.libraries,
              activeTab
            ).GetAllListings()}
            setEditorTarget={setEditorTarget}
          />
        </div>
        <VerticalResizer
          adjustWidth={offset =>
            setLeftColumnWidth(leftColumnWidth + offset * 2)
          }
        />
        <div
          className="c-library-manager__center"
          style={{ width: centerColumnWidth }}
        >
          <SelectedItemsManager
            activeTab={activeTab}
            libraries={props.libraries}
            editListing={setEditorTarget}
          />
        </div>
        <VerticalResizer
          adjustWidth={offset =>
            setCenterColumnWidth(centerColumnWidth + offset * 2)
          }
        />
        <div className="c-library-manager__editor">
          {editorTypeAndTarget && (
            <EditorView
              key={editorTypeAndTarget[1].Meta().Id}
              editorTypeAndTarget={editorTypeAndTarget}
              closeEditor={() => setEditorTypeAndTarget(null)}
              {...props}
            />
          )}
        </div>
      </div>
    </SelectionContext.Provider>
  );
}

function LibraryManagerListings(props: {
  listings: Listing<Listable>[];
  setEditorTarget: (item: Listing<any>) => void;
}) {
  const [filter, setFilter] = React.useState("");

  const filterCache = React.useRef(new FilterCache(props.listings)).current;
  filterCache.UpdateIfItemsChanged(props.listings);

  const filteredListings = filterCache.GetFilteredEntries(filter);

  const listingTree = BuildListingTree(
    l => <LibraryManagerRow key={l.Meta().Id} listing={l} {...props} />,
    l => ({ key: l.Meta().Path }),
    filteredListings
  );

  return (
    <div className="library">
      <div className="search-controls">
        <LibraryFilter applyFilterFn={setFilter} />
      </div>
      <ul className="listings zebra-stripe">{listingTree}</ul>;
    </div>
  );
}
