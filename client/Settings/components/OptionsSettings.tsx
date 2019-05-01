import React = require("react");
import { HpVerbosityOption } from "../../../common/PlayerViewSettings";
import {
  AutoGroupInitiativeOption,
  AutoRerollInitiativeOption
} from "../../../common/Settings";
import { Dropdown } from "./Dropdown";
import { Toggle } from "./Toggle";

interface OptionsSettingsProps {
  goToEpicInitiativeSettings: () => void;
}
export class OptionsSettings extends React.Component<OptionsSettingsProps> {
  public render() {
    return (
      <div className="tab-content options">
        <h3>Rules</h3>
        <Toggle fieldName="Rules.RollMonsterHp">
          Roll HP when adding combatant from statblock
        </Toggle>
        <Toggle fieldName="Rules.AllowNegativeHP">
          Allow combatants to have negative hit points
        </Toggle>
        <Toggle fieldName="Rules.AutoCheckConcentration">
          Automatically prompt for concentration checks
        </Toggle>
        <Dropdown
          fieldName="Rules.AutoGroupInitiative"
          options={AutoGroupInitiativeOption}
        >
          Automatically add creatures to initiative group
        </Dropdown>
        <Dropdown
          fieldName="Rules.AutoRerollInitiative"
          options={AutoRerollInitiativeOption}
        >
          Automatically reroll initiative at the end of each round:
        </Dropdown>

        <h3>Encounter View</h3>
        <Toggle fieldName="TrackerView.DisplayRoundCounter">
          Display Round Counter
        </Toggle>
        <Toggle fieldName="TrackerView.DisplayTurnTimer">
          Display Turn Timer
        </Toggle>
        <Toggle fieldName="TrackerView.DisplayDifficulty">
          Display Encounter Difficulty
        </Toggle>

        <h3>Player View</h3>
        <Toggle fieldName="PlayerView.DisplayRoundCounter">
          Display Round Counter
        </Toggle>
        <Toggle fieldName="PlayerView.DisplayTurnTimer">
          Display Turn Timer
        </Toggle>
        <Dropdown
          fieldName="PlayerView.MonsterHPVerbosity"
          options={HpVerbosityOption}
        >
          Non Player Character HP Verbosity
        </Dropdown>
        <Dropdown
          fieldName="PlayerView.PlayerHPVerbosity"
          options={HpVerbosityOption}
        >
          Player Character HP Verbosity
        </Dropdown>
        <Toggle fieldName="PlayerView.HideMonstersOutsideEncounter">
          Don't show NPCs in Player View until encounter is started
        </Toggle>
        <Toggle fieldName="PlayerView.AllowPlayerSuggestions">
          Allow players to suggest damage/healing
        </Toggle>
        <Toggle fieldName="PlayerView.ActiveCombatantOnTop">
          Active combatant at top of initiative list
        </Toggle>
        <div>
          {"Additional player view options available with "}
          <a href="#" onClick={this.props.goToEpicInitiativeSettings}>
            Epic Initiative
          </a>
        </div>
      </div>
    );
  }
}
