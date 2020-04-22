import * as React from "react";
import { SavedEncounter } from "../../common/SavedEncounter";
import { AccountClient } from "../Account/AccountClient";
import { SubmitButton } from "../Components/Button";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { Metrics } from "../Utility/Metrics";
import { PromptProps } from "./PendingPrompts";
import { AutocompleteTextInput } from "../StatBlockEditor/components/AutocompleteTextInput";
import { StandardPromptLayout } from "./StandardPromptLayout";
import { Field } from "formik";

export interface MoveEncounterPromptProps {
  folderNames: string[];
}

const promptClassName = "p-move-encounter";

function MoveEncounterPromptComponent(props: MoveEncounterPromptProps) {
  return (
    <StandardPromptLayout
      className={promptClassName}
      label="Move or rename encounter"
    >
      <span className="fas fa-folder" />
      <AutocompleteTextInput
        autoFocus
        fieldName="folderName"
        options={props.folderNames}
      />
      <Field type="text" name="encounterName" />
    </StandardPromptLayout>
  );
}

type MoveEncounterModel = {
  encounterName: string;
  folderName: string;
};

export function MoveEncounterPrompt(
  legacySavedEncounter: { Name?: string },
  moveListingFn: (encounter: SavedEncounter, oldId: string) => void,
  folderNames: string[]
): PromptProps<MoveEncounterModel> {
  const savedEncounter = UpdateLegacySavedEncounter(legacySavedEncounter);

  return {
    autoFocusSelector: "input[type='text']",
    initialValues: {
      folderName: savedEncounter.Path,
      encounterName: savedEncounter.Name
    },
    children: <MoveEncounterPromptComponent folderNames={folderNames} />,
    onSubmit: model => {
      const oldId = savedEncounter.Id;
      savedEncounter.Path = model.folderName;
      savedEncounter.Name = model.encounterName;
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
