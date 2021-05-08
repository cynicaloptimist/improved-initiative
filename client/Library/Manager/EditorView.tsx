import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { StatBlock } from "../../../common/StatBlock";
import { StatBlockEditor } from "../../StatBlockEditor/StatBlockEditor";
import { LibraryType } from "../Libraries";
import { Listing } from "../Listing";
import { LibraryManagerProps } from "./LibraryManager";

export function EditorView(
  props: LibraryManagerProps & {
    editorTypeAndTarget: [LibraryType, Listing<Listable>];
    defaultListing: Listable;
    closeEditor: () => void;
  }
) {
  const [editorType, editorTarget] = props.editorTypeAndTarget;
  const [loadedTarget, loadTarget] = useState<Listable | null>(null);

  React.useEffect(() => {
    editorTarget
      .GetWithTemplate(props.defaultListing)
      .then(item => loadTarget(item));
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

  return <div>Editor: {editorTarget.Meta().Name}</div>;
}
