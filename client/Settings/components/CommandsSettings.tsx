import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { CommandSetting } from "../../../common/CommandSetting";
import { Command } from "../../Commands/Command";
import { Info } from "../../Components/Info";
import { CommandInfoById } from "./CommandInfo";
import { ToggleButton } from "./Toggle";

interface CommandSettingRowProps {
  command: Command;
  commandIndex: number;
  withCombatantRow: boolean;
}

class CommandSettingRow extends React.Component<CommandSettingRowProps> {
  public render() {
    const info = CommandInfoById[this.props.command.Id];
    return (
      <div>
        <span className="command-description">
          {this.props.command.Description}
          {info && <Info>{info}</Info>}
        </span>
        <Field
          className="keybinding"
          name={`Commands[${this.props.commandIndex}].KeyBinding`}
        />
        <label className="toolbar-setting">
          <i className={"fas fa-" + this.props.command.FontAwesomeIcon} />
          <ToggleButton
            fieldName={`Commands[${this.props.commandIndex}].ShowOnActionBar`}
            disabled={this.props.command.LockOnActionBar}
          />
        </label>
        {this.props.withCombatantRow && (
          <label className="combatant-setting">
            <ToggleButton
              fieldName={`Commands[${this.props.commandIndex}].ShowInCombatantRow`}
            />
          </label>
        )}
      </div>
    );
  }
}

interface CommandsSettingsProps {
  commandSettings: CommandSetting[];
  encounterCommands: Command[];
  combatantCommands: Command[];
}

export class CommandsSettings extends React.Component<CommandsSettingsProps> {
  public render() {
    return (
      <div className="tab-content keybindings">
        <h2>Encounter Commands</h2>
        <div className="command-options-labels">
          <span className="hotkey-label">Hotkey</span>
          <span className="toolbar-label">Toolbar</span>
        </div>
        {this.props.encounterCommands.map(this.buildCommandSettingRow(false))}
        <h2>Combatant Commands</h2>
        <div className="command-options-labels">
          <span className="hotkey-label">Hotkey</span>
          <span className="toolbar-label">Toolbar</span>
          <span className="combatant-label">Inline</span>
        </div>
        {this.props.combatantCommands.map(this.buildCommandSettingRow(true))}
      </div>
    );
  }

  private buildCommandSettingRow(withCombatantRow: boolean) {
    return (command: Command) => {
      const index = _.findIndex(
        this.props.commandSettings,
        s => s.Name == command.Id
      );

      return (
        <CommandSettingRow
          withCombatantRow={withCombatantRow}
          command={command}
          commandIndex={index}
          key={index}
        />
      );
    };
  }
}
