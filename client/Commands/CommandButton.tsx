import { Command } from "./Command";
import { Button } from "../Components/Button";
import React = require("react");
import { useSubscription } from "../Combatant/linkComponentToObservables";

export function CommandButton(props: { command: Command; showLabel: boolean }) {
  const c = props.command;
  const buttonIsOnActionBar = useSubscription(c.ShowOnActionBar);
  const fontAwesomeIcon = useSubscription(c.FontAwesomeIcon);

  if (!buttonIsOnActionBar) {
    return null;
  }

  const buttonText = props.showLabel && c.Description;
  return (
    <Button
      additionalClassNames={"c-button--" + c.Id}
      key={c.Description}
      tooltip={commandButtonTooltip(c)}
      tooltipProps={{
        placement: "right",
        delay: 1000
      }}
      onClick={c.ActionBinding}
      fontAwesomeIcon={fontAwesomeIcon}
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
