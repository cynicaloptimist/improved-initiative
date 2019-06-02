import { Field } from "formik";
import * as React from "react";
import { probablyUniqueString } from "../../../common/Toolbox";
import { SubmitButton } from "../../Components/Button";
import { Encounter } from "../../Encounter/Encounter";
import { EncounterLibrary } from "../../Library/EncounterLibrary";
import { AutocompleteTextInput } from "../../StatBlockEditor/components/AutocompleteTextInput";
import { Metrics } from "../../Utility/Metrics";
import { EventLog } from "../../Widgets/EventLog";
import { PromptProps } from "./components/PendingPrompts";

interface SaveEncounterPromptComponentProps {
  autocompletePaths: string[];
}
interface SaveEncounterPromptComponentState {}
class SaveEncounterPromptComponent extends React.Component<
  SaveEncounterPromptComponentProps,
  SaveEncounterPromptComponentState
> {
  public render() {
    const fieldLabelId = probablyUniqueString();
    return (
      <div className="p-save-encounter">
        <label htmlFor={fieldLabelId}>{"Save Encounter As: "}</label>
        <label className="autohide-field__label label" htmlFor="Path">
          {"Folder: "}
        </label>
        <AutocompleteTextInput
          fieldName="Path"
          options={this.props.autocompletePaths}
          autoFocus
        />
        <Field id={fieldLabelId} name="Name" className="response" type="text" />
        <SubmitButton />
      </div>
    );
  }
}

interface SaveEncounterModel {
  Name: string;
  Path: string;
}

export function SaveEncounterPrompt(
  getSavedEncounter: typeof Encounter.prototype.GetSavedEncounter,
  saveEncounterToLibrary: typeof EncounterLibrary.prototype.Save,
  logEvent: typeof EventLog.prototype.AddEvent,
  autocompletePaths: string[]
): PromptProps<SaveEncounterModel> {
  return {
    initialValues: {
      Name: "",
      Path: ""
    },
    autoFocusSelector: ".response",
    children: (
      <SaveEncounterPromptComponent autocompletePaths={autocompletePaths} />
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
