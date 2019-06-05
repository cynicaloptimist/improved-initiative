import { Field } from "formik";
import * as React from "react";
import { probablyUniqueString } from "../../../common/Toolbox";
import { AccountClient } from "../../Account/AccountClient";
import { Button, SubmitButton } from "../../Components/Button";
import { Encounter } from "../../Encounter/Encounter";
import { EncounterLibrary } from "../../Library/EncounterLibrary";
import { AutocompleteTextInput } from "../../StatBlockEditor/components/AutocompleteTextInput";
import { Metrics } from "../../Utility/Metrics";
import { EventLog } from "../../Widgets/EventLog";
import { PromptProps } from "./components/PendingPrompts";

interface SaveEncounterPromptComponentProps {
  autocompletePaths: string[];
}
interface SaveEncounterPromptComponentState {
  advancedPrompt: boolean;
}
class SaveEncounterPromptComponent extends React.Component<
  SaveEncounterPromptComponentProps,
  SaveEncounterPromptComponentState
> {
  constructor(props) {
    super(props);
    this.state = {
      advancedPrompt: false
    };
  }

  public render() {
    const fieldLabelId = probablyUniqueString();
    return (
      <React.Fragment>
        <div className="p-save-encounter">
          <div className="p-save-encounter__basic">
            <label htmlFor={fieldLabelId}>{"Save Encounter As: "}</label>
            <Field
              id={fieldLabelId}
              name="Name"
              className="response"
              type="text"
            />
            <Button
              fontAwesomeIcon="caret-down"
              onClick={() =>
                this.setState(oldState => ({
                  advancedPrompt: !oldState.advancedPrompt
                }))
              }
            />
          </div>
          {this.state.advancedPrompt && this.renderAdvanced()}
        </div>
        <SubmitButton />
      </React.Fragment>
    );
  }

  private renderAdvanced = () => {
    return (
      <div className="p-save-encounter__advanced">
        <label className="autohide-field__label label" htmlFor="Path">
          {"Folder: "}
        </label>
        <AutocompleteTextInput
          fieldName="Path"
          options={this.props.autocompletePaths}
          autoFocus
        />
      </div>
    );
  };
}

interface SaveEncounterModel {
  Name: string;
  Path: string;
}

export function SaveEncounterPrompt(
  getEncounterState: typeof Encounter.prototype.GetEncounterState,
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

      const encounterState = getEncounterState();
      const id = AccountClient.MakeId(model.Name, model.Path);
      const savedEncounter = {
        Name: model.Name,
        Path: model.Path,
        Id: id,
        Combatants: encounterState.Combatants.filter(
          c => !c.PersistentCharacterId
        ),
        Version: process.env.VERSION
      };

      saveEncounterToLibrary(savedEncounter);
      logEvent(`Encounter saved as ${model.Name}.`);
      Metrics.TrackEvent("EncounterSaved", { Name: model.Name });
      return true;
    }
  };
}
