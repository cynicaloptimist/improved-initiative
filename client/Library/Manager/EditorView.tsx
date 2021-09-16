import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { Spell } from "../../../common/Spell";
import { StatBlock } from "../../../common/StatBlock";
import { SpellEditor } from "../../StatBlockEditor/SpellEditor";
import { StatBlockEditor } from "../../StatBlockEditor/StatBlockEditor";
import { GetDefaultForLibrary, LibraryType } from "../Libraries";
import { Listing } from "../Listing";
import { LibraryManagerProps } from "./LibraryManager";

export function EditorView(
  props: LibraryManagerProps & {
    editorTypeAndTarget: [LibraryType, Listing<Listable>];
    closeEditor: () => void;
  }
) {
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
    const statBlockListing = editorTarget as Listing<StatBlock>;
    return (
      <StatBlockEditor
        statBlock={loadedTarget as StatBlock}
        editorTarget="library"
        onSave={newStatBlock =>
          props.libraries.StatBlocks.SaveEditedListing(
            statBlockListing,
            newStatBlock
          )
        }
        onDelete={() =>
          props.libraries.StatBlocks.DeleteListing(statBlockListing.Meta().Id)
        }
        onSaveAsCharacter={statBlock =>
          props.libraries.StatBlocks.SaveEditedListing(
            statBlockListing,
            statBlock
          )
        }
        onSaveAsCopy={statBlock =>
          props.libraries.StatBlocks.SaveNewListing(statBlock)
        }
        onClose={props.closeEditor}
      />
    );
  }

  if (editorType === "PersistentCharacters") {
    const persistentCharacter = loadedTarget as PersistentCharacter;
    const hpDown =
      persistentCharacter.StatBlock.HP.Value - persistentCharacter.CurrentHP;
    return (
      <StatBlockEditor
        statBlock={persistentCharacter.StatBlock}
        editorTarget="persistentcharacter"
        onSave={(statBlock: StatBlock) =>
          props.librariesCommander.UpdatePersistentCharacterStatBlockInLibraryAndEncounter(
            persistentCharacter.Id,
            statBlock,
            hpDown
          )
        }
        onDelete={() =>
          props.libraries.PersistentCharacters.DeleteListing(
            persistentCharacter.Id
          )
        }
        currentListings={props.libraries.PersistentCharacters.GetAllListings()}
        onClose={props.closeEditor}
      />
    );
  }

  if (editorType === "Spells") {
    const spellListing = editorTarget as Listing<Spell>;
    const spell = loadedTarget as Spell;

    return (
      <SpellEditor
        spell={spell}
        onSave={spell =>
          props.libraries.Spells.SaveEditedListing(spellListing, spell)
        }
        onDelete={props.libraries.Spells.DeleteListing}
        onClose={props.closeEditor}
      />
    );
  }

  return <div>Editor: {editorTarget.Meta().Name}</div>;
}
