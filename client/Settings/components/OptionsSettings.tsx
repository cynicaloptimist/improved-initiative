import React = require("react");
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
          Roll monster HP when adding to combat
        </Toggle>
        <Toggle fieldName="Rules.AllowNegativeHP">
          Allow combatants to have negative hit points
        </Toggle>
        <Toggle fieldName="Rules.AutoCheckConcentration">
          Automatically prompt for concentration checks
        </Toggle>
        <p>
          Automatically add creatures to initiative group:
          <select data-bind="options: AutoGroupInitiativeOptions, value: AutoGroupInitiative" />
        </p>
        <p>
          Automatically reroll initiative at the end of each round:
          <select data-bind="options: AutoRerollInitiativeOptions, value: AutoRerollInitiative" />
        </p>

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
        <p>
          Monster HP Verbosity
          <select data-bind="options: HpVerbosityOptions, value: MonsterHpVerbosity" />
        </p>
        <p>
          Player HP Verbosity
          <select data-bind="options: HpVerbosityOptions, value: PlayerHpVerbosity" />
        </p>
        <Toggle fieldName="PlayerView.HideMonstersOutsideEncounter">
          Hide monsters when encounter is not active
        </Toggle>
        <Toggle fieldName="PlayerView.AllowPlayerSuggestions">
          Allow players to suggest damage/healing
        </Toggle>
        <Toggle fieldName="PlayerView.ActiveCombatantOnTop">
          Active combatant at top of initiative list
        </Toggle>
        <p>
          {"Additional player view options available with "}
          <a href="#" onClick={this.props.goToEpicInitiativeSettings}>
            Epic Initiative
          </a>
        </p>
      </div>
    );
  }
}
