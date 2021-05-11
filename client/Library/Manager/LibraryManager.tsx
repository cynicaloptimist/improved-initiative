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
import { StatBlockComponent } from "../../Components/StatBlock";
import { Tabs } from "../../Components/Tabs";
import { VerticalResizer } from "../../Layout/VerticalResizer";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { DifficultyCalculator } from "../../Widgets/DifficultyCalculator";
import {
  GetDefaultForLibrary,
  Libraries,
  LibraryFriendlyNames,
  LibraryType
} from "../Libraries";
import { Library } from "../Library";
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
          <LibraryManagerListings
            listingsComputed={
              activeLibrary(props.libraries, activeTab).GetListings
            }
            setEditorTarget={setEditorTarget}
          />
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
          <div style={{ flexShrink: 1 }}>{selectedItemsComponent}</div>
          <div style={{ flexFlow: "row" }}>
            <Button
              text="Move"
              fontAwesomeIcon="folder"
              onClick={() => setMoveTargets(selection.selected)}
            />
          </div>
          {moveTargets && (
            <MovePrompt
              targets={moveTargets}
              library={activeLibrary(props.libraries, activeTab)}
              done={() => setMoveTargets(null)}
            />
          )}
        </div>
      </div>
    </SelectionContext.Provider>
  );
}

function MovePrompt(props: {
  targets: Listing<Listable>[];
  library: Library<Listable>;
  done: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>();
  return (
    <div>
      <input autoFocus ref={inputRef} />
      <Button
        fontAwesomeIcon="check"
        onClick={async () => {
          if (!inputRef.current) {
            return;
          }
          const pathInput = inputRef.current.value;
          await Promise.all(
            props.targets.map(async targetListing => {
              const item = await props.library.GetItemById(
                targetListing.Meta().Id
              );
              item.Path = pathInput;
              return await props.library.SaveEditedListing(targetListing, item);
            })
          );
          props.done();
        }}
      />
    </div>
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
    key: activeTab,
    listings: selection.selected || [],
    friendlyName: LibraryFriendlyNames[activeTab],
    defaultListing: GetDefaultForLibrary(activeTab)
  };

  if (activeTab === "StatBlocks") {
    return (
      <SelectedItemsView
        {...partialViewProps}
        renderListing={(listing: StatBlock) => (
          <div style={{ width: 600 }}>
            <StatBlockComponent displayMode="default" statBlock={listing} />
          </div>
        )}
      />
    );
  }

  if (activeTab === "PersistentCharacters") {
    return (
      <SelectedItemsView
        {...partialViewProps}
        renderListing={(listing: PersistentCharacter) => (
          <div style={{ width: 600 }}>
            <StatBlockComponent
              displayMode="default"
              statBlock={listing.StatBlock}
            />
          </div>
        )}
      />
    );
  }

  if (activeTab === "Encounters") {
    return (
      <SelectedItemsView
        {...partialViewProps}
        renderListing={(listing: SavedEncounter) => {
          const encounterDifficulty = DifficultyCalculator.Calculate(
            listing.Combatants.map(c => c.StatBlock.Challenge),
            []
          );

          return (
            <div style={{ width: 600 }}>
              <h2>{listing.Name}</h2>
              <div>XP: {encounterDifficulty.EarnedExperience}</div>
              {listing.Combatants.map(c => (
                <div key={c.Id}>
                  <span>{c.StatBlock.Name}</span>
                </div>
              ))}
            </div>
          );
        }}
      />
    );
  }

  return null;
}
