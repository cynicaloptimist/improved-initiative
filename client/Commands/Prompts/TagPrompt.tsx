import * as _ from "lodash";
import * as React from "react";

import { Field, FieldProps } from "formik";
import { DurationTiming } from "../../../common/DurationTiming";
import { Combatant } from "../../Combatant/Combatant";
import { EndOfTurn, StartOfTurn, Tag } from "../../Combatant/Tag";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { Button, SubmitButton } from "../../Components/Button";
import { Encounter } from "../../Encounter/Encounter";
import { Conditions } from "../../Rules/Conditions";
import { EnumToggle } from "../../StatBlockEditor/EnumToggle";
import { AutocompleteTextInput } from "../../StatBlockEditor/components/AutocompleteTextInput";
import { Metrics } from "../../Utility/Metrics";
import { PromptProps } from "./PendingPrompts";

interface TagPromptProps {
  targetDisplayNames: string;
  combatantNamesById: { [id: string]: string };
  encounterIsActive: () => boolean;
}

interface TagPromptState {
  advancedMode: boolean;
}

export class TagPromptComponent extends React.Component<
  TagPromptProps,
  TagPromptState
> {
  constructor(props) {
    super(props);
    this.state = {
      advancedMode: false
    };
    linkComponentToObservables(this);
  }

  public render() {
    const encounterIsActive = this.props.encounterIsActive();
    const autoCompleteOptions = _.keys(Conditions).concat(
      _.values(this.props.combatantNamesById)
    );
    return (
      <>
        <div className="add-tag">
          <div>
            <label className="add-tag__label" htmlFor="tagText">
              Add a tag to {this.props.targetDisplayNames}
            </label>
            <AutocompleteTextInput
              fieldName="tagText"
              options={autoCompleteOptions}
              autoFocus
            />
            <Field name="tagHidden">
              {(fieldApi: FieldProps) => {
                if (fieldApi.field.value == true) {
                  return (
                    <Button
                      fontAwesomeIcon="eye-slash"
                      tooltip="Hide/Show tag in Player View"
                      onClick={() =>
                        fieldApi.form.setFieldValue(fieldApi.field.name, false)
                      }
                    />
                  );
                } else {
                  return (
                    <Button
                      fontAwesomeIcon="eye"
                      tooltip="Hide/Show tag in Player View"
                      onClick={() =>
                        fieldApi.form.setFieldValue(fieldApi.field.name, true)
                      }
                    />
                  );
                }
              }}
            </Field>
            <Field name="useDuration">
              {(fieldApi: FieldProps) => (
                <Button
                  fontAwesomeIcon="hourglass"
                  onClick={() => this.toggleAdvanced(fieldApi)}
                />
              )}
            </Field>
          </div>
          {this.state.advancedMode &&
            this.renderAdvancedFields(encounterIsActive)}
        </div>
        <SubmitButton />
      </>
    );
  }

  private toggleAdvanced = (fieldApi: FieldProps) => {
    const toggledMode = !this.state.advancedMode;
    fieldApi.form.setFieldValue(fieldApi.field.name, toggledMode);
    this.setState({ advancedMode: toggledMode });
  };

  private renderAdvancedFields = (encounterIsActive: boolean) => {
    if (!encounterIsActive) {
      return (
        <div className="add-tag__advanced">
          Start Encounter to enable tag durations.
        </div>
      );
    }

    return (
      <div className="add-tag__advanced">
        ...until
        <EnumToggle
          fieldName="tagTiming"
          labelsByOption={{
            [StartOfTurn]: "start of",
            [EndOfTurn]: "end of"
          }}
        />
        <Field component="select" name="tagTimingId">
          {this.renderCombatantOptions()}
        </Field>
        's turn in <Field type="number" name="tagDuration" /> round
      </div>
    );
  };

  private renderCombatantOptions = () =>
    _.toPairs(this.props.combatantNamesById).map(([id, name]) => (
      <option key={id} value={id}>
        {name}
      </option>
    ));
}

export interface TagModel {
  tagText: string;
  tagDuration?: number;
  tagTimingId?: string;
  tagTiming?: DurationTiming;
  useDuration: boolean;
  tagHidden: boolean;
}

export function TagPrompt(
  encounter: Encounter,
  targetCombatants: Combatant[],
  logEvent: (message: string) => void
): PromptProps<TagModel> {
  const activeCombatantId = encounter.EncounterFlow.ActiveCombatant()
    ? encounter.EncounterFlow.ActiveCombatant().Id
    : "";
  const combatantsById = _.keyBy(encounter.Combatants(), c => c.Id);
  const combatantNamesById = _.mapValues(combatantsById, c => c.DisplayName());

  return {
    initialValues: {
      tagText: "",
      tagTimingId: activeCombatantId,
      tagTiming: StartOfTurn,
      tagDuration: 1,
      useDuration: false,
      tagHidden: false
    },
    children: (
      <TagPromptComponent
        combatantNamesById={combatantNamesById}
        targetDisplayNames={targetCombatants
          .map(t => t.DisplayName())
          .join(", ")}
        encounterIsActive={() => encounter.EncounterFlow.State() == "active"}
      />
    ),
    onSubmit: (model: TagModel) => {
      if (model.tagText.length == 0) {
        return true;
      }

      if (
        encounter.EncounterFlow.State() == "inactive" ||
        !model.useDuration ||
        !model.tagDuration ||
        !model.tagTimingId
      ) {
        for (const combatant of targetCombatants) {
          const tag = new Tag(model.tagText, combatant, model.tagHidden);
          combatant.Tags.push(tag);
          Metrics.TrackEvent("TagAdded", { Text: tag.Text });
        }
      } else {
        // If tag is set to expire at the end of the current combatant's turn in one round,
        // we need to add a grace round so it doesn't end immediately at the end of this turn.
        const timingKeyedCombatant = _.find(
          encounter.Combatants(),
          c => model.tagTimingId == c.Id
        );
        const timingKeyedCombatantIsActive =
          timingKeyedCombatant.Id ==
          encounter.EncounterFlow.ActiveCombatant().Id;
        const durationGraceRound =
          timingKeyedCombatantIsActive && model.tagTiming == EndOfTurn ? 1 : 0;

        for (const combatant of targetCombatants) {
          const tag = new Tag(
            model.tagText,
            combatant,
            model.tagHidden,
            model.tagDuration + durationGraceRound,
            model.tagTiming,
            model.tagTimingId
          );
          encounter.EncounterFlow.AddDurationTag(tag);
          combatant.Tags.push(tag);
          Metrics.TrackEvent("TagAdded", {
            Text: tag.Text,
            Duration: tag.DurationRemaining()
          });
        }
      }

      logEvent(
        `Added "${model.tagText}" tag to ${targetCombatants
          .map(c => c.DisplayName())
          .join(", ")}`
      );

      return true;
    },
    autoFocusSelector: "input"
  };
}
