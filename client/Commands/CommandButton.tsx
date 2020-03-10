import { Command } from "./Command";
import { Button } from "../Components/Button";
import React = require("react");

export function CommandButton(props: { command: Command, showLabel: boolean }) {
  const c = props.command;
  const buttonText = props.showLabel && c.Description;
  return (
    <Button
      additionalClassNames={"c-button--" + c.Id}
      key={c.Description}
      tooltip={commandButtonTooltip(c)}
      tooltipProps={{
        boundary: "window",
        placement: "right",
        delay: 1000
      }}
      onClick={c.ActionBinding}
      fontAwesomeIcon={c.FontAwesomeIcon}
      text={buttonText}
    />
  );
}

function commandButtonTooltip(c: Command) {
  if (c.KeyBinding) {
    return `${c.Description} [${c.KeyBinding}]`;
  } else {
    return c.Description;
  }
}
