import * as React from "react";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { AccountClient } from "../../Account/AccountClient";
import { SubmitButton } from "../../Components/Button";
import { UpdateLegacySavedEncounter } from "../../Encounter/UpdateLegacySavedEncounter";
import { Metrics } from "../../Utility/Metrics";
import { PromptProps } from "./PendingPrompts";
import { AutocompleteTextInput } from "../../StatBlockEditor/components/AutocompleteTextInput";

export interface MoveEncounterPromptProps {
  encounterName: string;
  folderNames: string[];
}

const promptClassName = "p-move-encounter";

function MoveEncounterPromptComponent(props: MoveEncounterPromptProps) {
  return (
    <span className={promptClassName}>
      Move encounter {props.encounterName} to Folder:
      <AutocompleteTextInput
        autoFocus
        fieldName="folderName"
        options={props.folderNames}
      />
      <SubmitButton />
    </span>
  );
}

type MoveEncounterModel = {
  folderName: string;
};

export function MoveEncounterPrompt(
  legacySavedEncounter: { Name?: string },
  moveListingFn: (encounter: SavedEncounter, oldId: string) => void,
  folderNames: string[]
): PromptProps<MoveEncounterModel> {
  return {
    autoFocusSelector: "input[type='text']",
    initialValues: { folderName: "" },
    children: (
      <MoveEncounterPromptComponent
        encounterName={legacySavedEncounter.Name || ""}
        folderNames={folderNames}
      />
    ),
    onSubmit: model => {
      const savedEncounter = UpdateLegacySavedEncounter(legacySavedEncounter);

      if (savedEncounter.Path == model.folderName) {
        return true;
      }

      const oldId = savedEncounter.Id;
      savedEncounter.Path = model.folderName;
      savedEncounter.Id = AccountClient.MakeId(
        savedEncounter.Name,
        savedEncounter.Path
      );
      moveListingFn(savedEncounter, oldId);
      Metrics.TrackEvent("EncounterMoved", { Path: model.folderName });

      return true;
    }
  };
}
