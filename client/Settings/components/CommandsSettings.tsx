import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { CommandSetting } from "../../../common/CommandSetting";
import { Command } from "../../Commands/Command";
import { ToggleButton } from "./Toggle";

interface CommandSettingRowProps {
  command: Command;
  commandIndex: number;
}

class CommandSettingRow extends React.Component<CommandSettingRowProps> {
  public render() {
    return (
      <div>
        <span className="command-description">
          {this.props.command.Description}
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
          <span className="toolbar-label">Show on Toolbar</span>
        </div>
        {this.props.encounterCommands.map(this.buildCommandSettingRow)}
        <h2>Combatant Commands</h2>
        {this.props.combatantCommands.map(this.buildCommandSettingRow)}
      </div>
    );
  }

  private buildCommandSettingRow = (command: Command) => {
    let index = _.findIndex(
      this.props.commandSettings,
      s => s.Name == command.Id
    );

    return (
      <CommandSettingRow command={command} commandIndex={index} key={index} />
    );
  };
}
