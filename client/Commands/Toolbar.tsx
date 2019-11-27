import * as React from "react";
import { Button } from "../Components/Button";
import { Command } from "./Command";

interface ToolbarProps {
  encounterCommands: Command[];
  combatantCommands: Command[];
  width: "narrow" | "wide";
  showCombatantCommands: boolean;
}

export function Toolbar(props: ToolbarProps) {
  const [widthStyle, setWidthStyle] = React.useState<string>("auto");

  let outerElement = React.useRef<HTMLDivElement>(null);
  let innerElement = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!outerElement.current || !innerElement.current) {
      return;
    }
    //Force the scrollbar out of view
    const width =
      outerElement.current.offsetWidth +
      innerElement.current.offsetWidth -
      innerElement.current.clientWidth;
    setWidthStyle(width.toString() + "px");
  });

  const className = `c-toolbar s-${props.width}`;
  const commandButtonTooltip = (c: Command) => {
    if (c.KeyBinding) {
      return `${c.Description} [${c.KeyBinding}]`;
    } else {
      return c.Description;
    }
  };
  const commandToButton = (c: Command) => (
    <Button
      additionalClassNames={"c-button--" + c.Id}
      key={c.Description}
      tooltip={commandButtonTooltip(c)}
      tooltipProps={{
        boundary: "window",
        placement: "right",
        flip: false
      }}
      onClick={c.ActionBinding}
      fontAwesomeIcon={c.FontAwesomeIcon}
      text={props.width == "wide" ? c.Description : ""}
    />
  );
  const encounterCommandButtons = props.encounterCommands.map(commandToButton);
  const combatantCommandButtons = props.combatantCommands.map(commandToButton);

  const style: React.CSSProperties =
    props.width == "narrow" ? { width: widthStyle } : {};

  return (
    <div className={className} ref={outerElement}>
      <div className="scrollframe" ref={innerElement} style={style}>
        <div className="commands-encounter">{encounterCommandButtons}</div>
        {props.showCombatantCommands && (
          <div className="commands-combatant">{combatantCommandButtons}</div>
        )}
      </div>
    </div>
  );
}
