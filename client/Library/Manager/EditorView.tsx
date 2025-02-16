import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { Spell } from "../../../common/Spell";
import { StatBlock } from "../../../common/StatBlock";
import { SavedEncounterEditor } from "../../StatBlockEditor/SavedEncounterEditor";
import { SpellEditor } from "../../StatBlockEditor/SpellEditor";
import { StatBlockEditor } from "../../StatBlockEditor/StatBlockEditor";
import { GetDefaultForLibrary, LibraryType } from "../Libraries";
import { Listing } from "../Listing";
import { LibraryManagerProps } from "./LibraryManager";

type EditorViewProps = LibraryManagerProps & {
  editorTypeAndTarget: [LibraryType, Listing<Listable>];
  closeEditor: () => void;
};

export function EditorView(props: EditorViewProps) {
  const [editorType, editorTarget] = props.editorTypeAndTarget;
  const [loadedTarget, loadTarget] = useState<Listable | null>(null);
  const defaultListing = GetDefaultForLibrary(editorType);

  React.useEffect(() => {
    editorTarget.GetWithTemplate(defaultListing).then(item => loadTarget(item));
  }, [editorTarget]);

  if (!loadedTarget) {
    return <div>{"Loading " + editorTarget.Meta().Name}</div>;
  }

  if (editorType === "StatBlocks") {
    return RenderStatBlockEditor(editorTarget, loadedTarget, props);
  }

  if (editorType === "PersistentCharacters") {
    return RenderPersistentCharacterEditor(loadedTarget, props);
  }

  if (editorType === "Spells") {
    return RenderSpellEditor(editorTarget, loadedTarget, props);
  }

  if (editorType === "Encounters") {
    return RenderSavedEncounterEditor(editorTarget, loadedTarget, props);
  }

  return <div>No editor for {editorTarget.Meta().Name}</div>;
}

function RenderStatBlockEditor(
  editorTarget: Listing<Listable>,
  loadedTarget: Listable,
  props: EditorViewProps
) {
  const statBlockListing = editorTarget as Listing<StatBlock>;
  return (
    <StatBlockEditor
      statBlock={loadedTarget as StatBlock}
      editorTarget="library"
      onSave={newStatBlock => {
        props.libraries.StatBlocks.SaveEditedListing(
          statBlockListing,
          newStatBlock
        );
        props.closeEditor();
      }}
      onDelete={() => {
        props.libraries.StatBlocks.DeleteListing(statBlockListing.Meta().Id);
        props.closeEditor();
      }}
      onSaveAsCharacter={statBlock => {
        // Does this work?
        props.libraries.StatBlocks.SaveEditedListing(
          statBlockListing,
          statBlock
        );
        props.closeEditor();
      }}
      onSaveAsCopy={statBlock => {
        props.libraries.StatBlocks.SaveNewListing(statBlock);
        props.closeEditor();
      }}
      onClose={props.closeEditor}
    />
  );
}

function RenderPersistentCharacterEditor(
  loadedTarget: Listable,
  props: EditorViewProps
) {
  const persistentCharacter = loadedTarget as PersistentCharacter;
  const hpDown =
    persistentCharacter.StatBlock.HP.Value - persistentCharacter.CurrentHP;
  return (
    <StatBlockEditor
      statBlock={persistentCharacter.StatBlock}
      editorTarget="persistentcharacter"
      onSave={(statBlock: StatBlock) => {
        props.librariesCommander.UpdatePersistentCharacterStatBlockInLibraryAndEncounter(
          persistentCharacter.Id,
          statBlock,
          hpDown
        );
        props.closeEditor();
      }}
      onDelete={() => {
        props.libraries.PersistentCharacters.DeleteListing(
          persistentCharacter.Id
        );
        props.closeEditor();
      }}
      currentListings={props.libraries.PersistentCharacters.GetAllListings()}
      onClose={props.closeEditor}
    />
  );
}

function RenderSpellEditor(
  editorTarget: Listing<Listable>,
  loadedTarget: Listable,
  props: EditorViewProps
) {
  const spellListing = editorTarget as Listing<Spell>;
  const spell = loadedTarget as Spell;

  return (
    <SpellEditor
      spell={spell}
      onSave={spell => {
        props.libraries.Spells.SaveEditedListing(spellListing, spell);
        props.closeEditor();
      }}
      onDelete={spellId => {
        props.libraries.Spells.DeleteListing(spellId);
        props.closeEditor();
      }}
      onClose={props.closeEditor}
    />
  );
}

function RenderSavedEncounterEditor(
  editorTarget: Listing<Listable>,
  loadedTarget: Listable,
  props: EditorViewProps
) {
  const savedEncounterListing = editorTarget as Listing<SavedEncounter>;
  const savedEncounter = loadedTarget as SavedEncounter;
  return (
    <SavedEncounterEditor
      savedEncounter={savedEncounter}
      onSave={updatedEncounter => {
        props.libraries.Encounters.SaveEditedListing(
          savedEncounterListing,
          updatedEncounter
        );
        props.closeEditor();
      }}
      onClose={props.closeEditor}
    />
  );
}
