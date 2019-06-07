import { Field } from "formik";
import * as React from "react";
import { CombatantState } from "../../../common/CombatantState";
import { EncounterState } from "../../../common/EncounterState";
import { probablyUniqueString } from "../../../common/Toolbox";
import { AccountClient } from "../../Account/AccountClient";
import { Button, SubmitButton } from "../../Components/Button";
import { env } from "../../Environment";
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
            <label>
              {"Save Encounter As: "}
              <Field
                id={fieldLabelId}
                name="Name"
                className="response"
                type="text"
              />
            </label>
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
        <label>
          {"Folder: "}
          <AutocompleteTextInput
            fieldName="Path"
            options={this.props.autocompletePaths}
            autoFocus
          />
        </label>
        {env.HasEpicInitiative && (
          <label>
            {"Background Image URL: "}
            <Field type="text" name="BackgroundImageUrl" />
          </label>
        )}
      </div>
    );
  };
}

interface SaveEncounterModel {
  Name: string;
  Path: string;
  BackgroundImageUrl: string;
}

export function SaveEncounterPrompt(
  encounterState: EncounterState<CombatantState>,
  backgroundImageUrl: string,
  saveEncounterToLibrary: typeof EncounterLibrary.prototype.Save,
  logEvent: typeof EventLog.prototype.AddEvent,
  autocompletePaths: string[]
): PromptProps<SaveEncounterModel> {
  return {
    initialValues: {
      Name: "",
      Path: "",
      BackgroundImageUrl: backgroundImageUrl
    },
    autoFocusSelector: ".response",
    children: (
      <SaveEncounterPromptComponent autocompletePaths={autocompletePaths} />
    ),
    onSubmit: (model: SaveEncounterModel) => {
      if (!model.Name) return false;

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
