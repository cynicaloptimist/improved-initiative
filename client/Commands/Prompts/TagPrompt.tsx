import * as Awesomplete from "awesomplete";
import * as _ from "lodash";
import * as React from "react";

import { Field } from "formik";
import { DurationTiming } from "../../../common/DurationTiming";
import { Combatant } from "../../Combatant/Combatant";
import { EndOfTurn, StartOfTurn, Tag } from "../../Combatant/Tag";
import { Button, SubmitButton } from "../../Components/Button";
import { Encounter } from "../../Encounter/Encounter";
import { Conditions } from "../../Rules/Conditions";
import { EnumToggle } from "../../StatBlockEditor/EnumToggle";
import { AutocompleteTextInput } from "../../StatBlockEditor/components/AutocompleteTextInput";
import { Metrics } from "../../Utility/Metrics";
import { PromptProps } from "./components/PendingPrompts";

interface TagPromptProps {
  targetDisplayNames: string;
  combatantNamesById: { [id: string]: string };
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
  }

  public render() {
    return (
      <div className="add-tag">
        <div>
          Add a tag to {this.props.targetDisplayNames}:
          <AutocompleteTextInput
            fieldName="tagText"
            options={Object.keys(Conditions)}
            autoFocus
          />
          <Button fontAwesomeIcon="hourglass" onClick={this.toggleAdvanced} />
          <SubmitButton />
        </div>
        {this.state.advancedMode && this.renderAdvancedFields()}
      </div>
    );
  }

  private toggleAdvanced = () =>
    this.setState({ advancedMode: !this.state.advancedMode });

  private renderAdvancedFields = () => (
    <div className="tag-advanced">
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

  private renderCombatantOptions = () =>
    _.toPairs(this.props.combatantNamesById).map(([id, name]) => (
      <option key={id} value={id}>
        {name}
      </option>
    ));
}

export interface TagModel {
  tagText: string;
  tagDuration?: string;
  tagTimingId?: string;
  tagTiming?: DurationTiming;
}

export function TagPrompt(
  encounter: Encounter,
  targetCombatants: Combatant[],
  logEvent: (message: string) => void
): PromptProps<TagModel> {
  const activeCombatantId = encounter.ActiveCombatant()
    ? encounter.ActiveCombatant().Id
    : "";
  const combatantsById = _.keyBy(encounter.Combatants(), c => c.Id);
  const combatantNamesById = _.mapValues(combatantsById, c => c.DisplayName());

  return {
    initialValues: {
      tagText: "",
      tagTimingId: activeCombatantId,
      tagTiming: StartOfTurn
    },
    children: (
      <TagPromptComponent
        combatantNamesById={combatantNamesById}
        targetDisplayNames={targetCombatants
          .map(t => t.DisplayName())
          .join(", ")}
      />
    ),
    onSubmit: (model: TagModel) => {
      if (model.tagText.length == 0) {
        return true;
      }

      if (!model.tagDuration || !model.tagTimingId) {
        for (const combatant of targetCombatants) {
          const tag = new Tag(model.tagText, combatant);
          combatant.Tags.push(tag);
          Metrics.TrackEvent("TagAdded", { Text: tag.Text });
        }
      } else {
        const duration = parseInt(model.tagDuration);
        if (isNaN(duration)) {
          return false;
        }

        // If tag is set to expire at the end of the current combatant's turn in one round,
        // we need to add a grace round so it doesn't end immediately at the end of this turn.
        const timingKeyedCombatant = _.find(
          this.encounter.Combatants(),
          c => model.tagTimingId == c.Id
        );
        const timingKeyedCombatantIsActive =
          timingKeyedCombatant.Id == encounter.ActiveCombatant().Id;
        const durationGraceRound =
          timingKeyedCombatantIsActive && model.tagTiming == EndOfTurn ? 1 : 0;

        for (const combatant of this.targetCombatants) {
          const tag = new Tag(
            model.tagText,
            combatant,
            duration + durationGraceRound,
            model.tagTiming,
            model.tagTimingId
          );
          encounter.AddDurationTag(tag);
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

      encounter.QueueEmitEncounter();

      return true;
    },
    autoFocusSelector: "input"
  };
}
