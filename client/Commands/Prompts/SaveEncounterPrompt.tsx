import { Field } from "formik";
import * as React from "react";
import { probablyUniqueString } from "../../../common/Toolbox";
import { SubmitButton } from "../../Components/Button";
import { Encounter } from "../../Encounter/Encounter";
import { EncounterLibrary } from "../../Library/EncounterLibrary";
import { Metrics } from "../../Utility/Metrics";
import { EventLog } from "../../Widgets/EventLog";
import { PromptProps } from "./components/PendingPrompts";

interface SaveEncounterModel {
  Name: string;
  Path: string;
}

export function SaveEncounterPrompt(
  getSavedEncounter: typeof Encounter.prototype.GetSavedEncounter,
  saveEncounterToLibrary: typeof EncounterLibrary.prototype.Save,
  logEvent: typeof EventLog.prototype.AddEvent
): PromptProps<SaveEncounterModel> {
  const fieldLabelId = probablyUniqueString();
  return {
    initialValues: {
      Name: "",
      Path: ""
    },
    autoFocusSelector: ".response",
    children: (
      <div className="p-save-encounter">
        <label htmlFor={fieldLabelId}>{"Save Encounter As: "}</label>
        <Field id={fieldLabelId} name="Name" className="response" type="text" />
        <SubmitButton />
      </div>
    ),
    onSubmit: (model: SaveEncounterModel) => {
      if (!model.Name) return false;

      const savedEncounter = getSavedEncounter(model.Name, model.Path);
      saveEncounterToLibrary(savedEncounter);
      logEvent(`Encounter saved as ${model.Name}.`);
      Metrics.TrackEvent("EncounterSaved", { Name: model.Name });
      return true;
    }
  };
}
