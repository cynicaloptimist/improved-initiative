import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { LibraryFriendlyNames, LibraryType, Libraries } from "../Libraries";
import { Listing } from "../Listing";
import { ActiveLibrary } from "./ActiveLibrary";
import { DeletePrompt } from "./DeletePrompt";
import { MovePrompt } from "./MovePrompt";
import { SelectedItemsViewForActiveTab } from "./SelectedItemsViewForActiveTab";
import { SelectionContext } from "./SelectionContext";
import { Library } from "../useLibrary";

type PromptTypeAndTargets = ["move" | "delete", Listing<Listable>[]] | null;

export function SelectedItemsManager(props: {
  activeTab: LibraryType;
  libraries: Libraries;
  editListing: (listing: Listing<Listable>) => void;
}) {
  const [promptTypeAndTargets, setPromptTypeAndTargets] = useState<
    PromptTypeAndTargets
  >(null);

  const selection = React.useContext(SelectionContext);

  return (
    <div style={{ width: 600, margin: 5 }}>
      {selection.selected.length > 0 && (
        <div style={{ flexFlow: "row", alignItems: "center" }}>
          <h2 style={{ flexGrow: 1 }}>
            Selected {LibraryFriendlyNames[props.activeTab]}
          </h2>
          {selection.selected.length === 1 && (
            <Button
              text="Edit"
              fontAwesomeIcon="edit"
              onClick={() => props.editListing(selection.selected[0])}
            />
          )}
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
      <div className="c-library-manager__selection" style={{ flexShrink: 1 }}>
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
