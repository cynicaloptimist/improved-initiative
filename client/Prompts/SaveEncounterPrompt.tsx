import { Field, FieldArray, FieldProps } from "formik";
import * as React from "react";
import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { SavedEncounter } from "../../common/SavedEncounter";
import { probablyUniqueString } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";
import { Button, SubmitButton } from "../Components/Button";
import { env } from "../Environment";
import { ObservableBackedLibrary } from "../Library/ObservableBackedLibrary";
import { ToggleButton } from "../Settings/components/Toggle";
import { AutocompleteTextInput } from "../StatBlockEditor/components/AutocompleteTextInput";
import { Metrics } from "../Utility/Metrics";
import { EventLog } from "../Widgets/EventLog";
import { PromptProps } from "./PendingPrompts";

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
      <>
        <div className="p-save-encounter">
          <div className="p-save-encounter__basic">
            <label>
              <div className="p-save-encounter__label">Save Encounter As</div>
              <Field
                id={fieldLabelId}
                name="Name"
                className="response"
                type="text"
              />
            </label>
            <Button
              fontAwesomeIcon="wrench"
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
      </>
    );
  }

  private renderAdvanced = () => {
    return (
      <div className="p-save-encounter__advanced">
        <label>
          <div className="p-save-encounter__label">Folder</div>
          <AutocompleteTextInput
            fieldName="Path"
            options={this.props.autocompletePaths}
            autoFocus
          />
        </label>
        <div className="p-save-encounter__include-combatants">
          <div className="p-save-encounter__label">Include Combatants</div>
          <div className="p-save-encounter__character-combatants">
            <Field name="CharacterCombatants">
              {this.renderCombatantInclusionRow}
            </Field>
          </div>
          <div className="p-save-encounter__non-character-combatants">
            <Field name="NonCharacterCombatants">
              {this.renderCombatantInclusionRow}
            </Field>
          </div>
        </div>
        {env.HasEpicInitiative && (
          <label>
            <div className="p-save-encounter__label">Background Image URL</div>
            <Field type="text" name="BackgroundImageUrl" />
          </label>
        )}
      </div>
    );
  };

  private renderCombatantInclusionRow = (fieldApi: FieldProps) =>
    fieldApi.field.value.map((inclusion: CombatantInclusionModel, index) => {
      return (
        <label
          className="p-save-encounter__include-combatant"
          key={inclusion.CombatantId}
        >
          {inclusion.Name}{" "}
          <ToggleButton
            fieldName={`${fieldApi.field.name}[${index}].Include`}
          />
        </label>
      );
    });
}

interface CombatantInclusionModel {
  Name: string;
  CombatantId: string;
  Include: boolean;
}

interface SaveEncounterModel {
  Name: string;
  Path: string;
  BackgroundImageUrl: string;
  CharacterCombatants: CombatantInclusionModel[];
  NonCharacterCombatants: CombatantInclusionModel[];
}

export function SaveEncounterPrompt(
  encounterState: EncounterState<CombatantState>,
  backgroundImageUrl: string,
  saveEncounterToLibrary: typeof ObservableBackedLibrary.prototype.SaveNewListing,
  logEvent: typeof EventLog.prototype.AddEvent,
  autocompletePaths: string[]
): PromptProps<SaveEncounterModel> {
  return {
    initialValues: {
      Name: "",
      Path: "",
      BackgroundImageUrl: backgroundImageUrl,
      NonCharacterCombatants: encounterState.Combatants.filter(
        c => c.PersistentCharacterId == null
      ).map(c => ({
        Name:
          (c.Alias || c.StatBlock.Name) +
          (c.IndexLabel ? " " + c.IndexLabel : ""),
        CombatantId: c.Id,
        Include: true
      })),
      CharacterCombatants: encounterState.Combatants.filter(
        c => c.PersistentCharacterId != null
      ).map(c => ({
        Name: c.Alias || c.StatBlock.Name,
        CombatantId: c.Id,
        Include: false
      }))
    },
    autoFocusSelector: ".response",
    children: (
      <SaveEncounterPromptComponent autocompletePaths={autocompletePaths} />
    ),
    onSubmit: (model: SaveEncounterModel) => {
      if (!model.Name) return false;

      const inclusionByCombatantId = {};
      for (const combatant of model.NonCharacterCombatants) {
        inclusionByCombatantId[combatant.CombatantId] = combatant.Include;
      }
      for (const combatant of model.CharacterCombatants) {
        inclusionByCombatantId[combatant.CombatantId] = combatant.Include;
      }

      const id = AccountClient.MakeId(model.Name, model.Path);
      const savedEncounter: SavedEncounter = {
        Name: model.Name,
        Path: model.Path,
        Id: id,
        Combatants: encounterState.Combatants.filter(
          c => inclusionByCombatantId[c.Id]
        ),
        BackgroundImageUrl: model.BackgroundImageUrl,
        Version: process.env.VERSION
      };

      saveEncounterToLibrary(savedEncounter);
      logEvent(`Encounter saved as ${model.Name}.`);
      Metrics.TrackEvent("EncounterSaved", { Name: model.Name });
      return true;
    }
  };
}
