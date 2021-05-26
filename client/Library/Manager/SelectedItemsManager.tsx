import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { Libraries, LibraryFriendlyNames, LibraryType } from "../Libraries";
import { Library } from "../Library";
import { Listing } from "../Listing";
import { ActiveLibrary } from "./ActiveLibrary";
import { DeletePrompt } from "./DeletePrompt";
import { MovePrompt } from "./MovePrompt";
import { SelectedItemsViewForActiveTab } from "./SelectedItemsViewForActiveTab";
import { SelectionContext } from "./SelectionContext";

type PromptTypeAndTargets = ["move" | "delete", Listing<Listable>[]] | null;

export function SelectedItemsManager(props: {
  activeTab: LibraryType;
  libraries: Libraries;
}) {
  const [promptTypeAndTargets, setPromptTypeAndTargets] = useState<
    PromptTypeAndTargets
  >(null);

  const selection = React.useContext(SelectionContext);

  return (
    <div style={{ width: 600 }}>
      {selection.selected.length > 0 && (
        <div style={{ flexFlow: "row", alignItems: "center" }}>
          <h2 style={{ flexGrow: 1 }}>
            Selected {LibraryFriendlyNames[props.activeTab]}
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
        library={ActiveLibrary(props.libraries, props.activeTab)}
        done={() => setPromptTypeAndTargets(null)}
      />
      <div style={{ flexShrink: 1 }}>
        <SelectedItemsViewForActiveTab
          selection={selection}
          activeTab={props.activeTab}
        />
      </div>
    </div>
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
