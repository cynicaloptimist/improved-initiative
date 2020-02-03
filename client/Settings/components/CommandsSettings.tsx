import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { CommandSetting } from "../../../common/CommandSetting";
import { Command } from "../../Commands/Command";
import { Info } from "../../Components/Info";
import { CommandInfoById } from "./CommandInfo";
import { ToggleButton } from "./Toggle";

type CommandSettingRowProps = {
  command: Command;
  commandIndex: number;
  withCombatantRow: boolean;
};

function CommandSettingRow(props: CommandSettingRowProps) {
  const info = CommandInfoById[props.command.Id];
  return (
    <div>
      <span className="command-description">
        {props.command.Description}
        {info && <Info>{info}</Info>}
      </span>
      <Field
        className="keybinding"
        name={`Commands[${props.commandIndex}].KeyBinding`}
      />
      <label className="toolbar-setting">
        <i className={"fas fa-" + props.command.FontAwesomeIcon} />
        <ToggleButton
          fieldName={`Commands[${props.commandIndex}].ShowOnActionBar`}
          disabled={props.command.LockOnActionBar}
        />
      </label>
      {props.withCombatantRow && (
        <label className="combatant-setting">
          <ToggleButton
            fieldName={`Commands[${props.commandIndex}].ShowInCombatantRow`}
          />
        </label>
      )}
    </div>
  );
}

type CommandsSettingsProps = {
  commandSettings: CommandSetting[];
  encounterCommands: Command[];
  combatantCommands: Command[];
};

export function CommandsSettings(props: CommandsSettingsProps) {
  return (
    <div className="tab-content keybindings">
      <h2>Encounter Commands</h2>
      <div className="command-options-labels">
        <span className="hotkey-label">Hotkey</span>
        <span className="toolbar-label">Toolbar</span>
      </div>
      {props.encounterCommands.map(buildCommandSettingRow(props, false))}
      <h2>Combatant Commands</h2>
      <div className="command-options-labels">
        <span className="hotkey-label">Hotkey</span>
        <span className="toolbar-label">Toolbar</span>
        <span className="combatant-label">Inline</span>
      </div>
      {props.combatantCommands.map(buildCommandSettingRow(props, true))}
    </div>
  );
}

function buildCommandSettingRow(
  props: CommandsSettingsProps,
  withCombatantRow: boolean
) {
  return (command: Command) => {
    const index = _.findIndex(props.commandSettings, s => s.Name == command.Id);

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
